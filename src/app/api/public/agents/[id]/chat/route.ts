import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/server";
import { generateAgentResponse } from "@/lib/anthropic";
import { textToSpeech } from "@/lib/elevenlabs";
import { fetchKnowledgeContext } from "@/lib/knowledge";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// POST /api/public/agents/[id]/chat - Public (unauthenticated) text chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const supabase = createAnonClient();

    const body = await request.json();
    const { message, session_id } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch agent - must be public and active
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("is_public", true)
      .eq("status", "active")
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found or not publicly accessible" },
        { status: 404 }
      );
    }

    // Get or create conversation using session_id for anonymous users
    let convId: string | null = null;

    if (session_id) {
      // Try to find existing conversation for this session
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("agent_id", agentId)
        .eq("session_id", session_id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingConv) {
        convId = existingConv.id;
      }
    }

    if (!convId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .insert({
          agent_id: agentId,
          user_id: agent.user_id, // Use agent owner's ID
          session_id: session_id || null,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      convId = conversation?.id ?? null;

      if (!convId) {
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }
    }

    // Parallelize: save user message, fetch history, and fetch knowledge context
    const [, historyResult, knowledgeResult] = await Promise.all([
      // Save user message (non-critical)
      convId
        ? Promise.resolve(supabase.from("messages").insert({
            conversation_id: convId,
            role: "user",
            content: message,
            tokens_used: 0,
            latency_ms: 0,
          })).then(() => undefined).catch((err: unknown) => {
            console.error("[PublicChat] Error saving user message:", err);
          })
        : Promise.resolve(undefined),
      // Get conversation history
      Promise.resolve(supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })
        .limit(agent.max_turns * 2)
      ).then((res) => res.data)
        .catch((err: unknown) => {
          console.error("[PublicChat] Error fetching history:", err);
          return null;
        }),
      // Fetch knowledge base context
      fetchKnowledgeContext(supabase, agentId).catch((kbErr: unknown) => {
        console.error("[KB] Error fetching knowledge context:", kbErr);
        return "";
      }),
    ]);

    const history = historyResult;
    const conversationHistory = (history || [])
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: (m.role === "agent" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      }));

    const knowledgeContext = knowledgeResult || "";

    // Build system prompt
    const basePrompt = agent.system_prompt || "You are a helpful assistant.";
    const knowledgeSection = knowledgeContext
      ? `\n\nKNOWLEDGE BASE:\n${knowledgeContext}\n\nUse the above knowledge base information to answer user questions accurately. If the answer is in the knowledge base, use it. If not, use your general knowledge but mention you're not sure if it's specific to their context.`
      : "";
    const conversationalPrompt = `${basePrompt}${knowledgeSection}

IMPORTANT CONVERSATION GUIDELINES:
- You are a voice-first conversational AI agent. Keep responses natural, warm, and conversational.
- Use short, clear sentences suitable for spoken dialogue. Avoid long paragraphs.
- Do NOT use markdown formatting like ##, **, or bullet lists in your responses. Speak naturally.
- Keep responses concise - aim for 2-4 sentences unless the user asks for detailed information.
- Use a warm, friendly tone while staying professional.`;

    // Generate response
    const startTime = Date.now();
    const response = await generateAgentResponse({
      systemPrompt: conversationalPrompt,
      conversationHistory: conversationHistory.slice(0, -1),
      userMessage: message,
      model: agent.llm_model || "claude-sonnet-4",
      temperature: agent.temperature || 0.7,
    });
    const latencyMs = Date.now() - startTime;

    // Save agent response
    if (convId) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "agent",
        content: response.text,
        tokens_used: response.inputTokens + response.outputTokens,
        latency_ms: latencyMs,
      });
    }

    // Generate TTS audio
    let audioUrl: string | null = null;
    const hasElevenLabsKey = !!process.env.ELEVENLABS_API_KEY;
    const voiceId = agent.voice_id || DEFAULT_VOICE_ID;

    if (hasElevenLabsKey) {
      try {
        const plainText = response.text
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/- /g, ". ")
          .replace(/\n+/g, " ")
          .trim()
          .substring(0, 5000);

        const voiceSettings = agent.voice_settings as Record<string, number> | null;
        const ttsResponse = await textToSpeech(voiceId, plainText, {
          stability: voiceSettings?.stability,
          similarity_boost: voiceSettings?.similarity_boost,
          style: voiceSettings?.style,
          speed: voiceSettings?.speed,
        }, agent.language);

        const audioBuffer = await ttsResponse.arrayBuffer();
        if (audioBuffer.byteLength > 0) {
          const base64 = Buffer.from(audioBuffer).toString("base64");
          audioUrl = `data:audio/mpeg;base64,${base64}`;
        }
      } catch (ttsError) {
        console.error("[TTS] Error:", ttsError);
      }
    }

    return NextResponse.json({
      text: response.text,
      audio_url: audioUrl,
      conversation_id: convId,
      tokens_used: response.inputTokens + response.outputTokens,
      latency_ms: latencyMs,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Public chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
