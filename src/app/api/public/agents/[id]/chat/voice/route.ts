import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/server";
import { generateAgentResponse } from "@/lib/anthropic";
import { textToSpeech, speechToText } from "@/lib/elevenlabs";
import { fetchKnowledgeContext } from "@/lib/knowledge";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// POST /api/public/agents/[id]/chat/voice - Public (unauthenticated) voice chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const supabase = createAnonClient();

    const formData = await request.formData();
    const audioBlob = formData.get("audio") as Blob;
    const conversationId = formData.get("conversation_id") as string;

    if (!audioBlob) {
      return NextResponse.json({ error: "Audio is required" }, { status: 400 });
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

    // Parallelize: transcribe audio and fetch knowledge context (independent operations)
    const [sttResult, knowledgeResult] = await Promise.all([
      speechToText(audioBlob, agent.language).catch((sttError: unknown) => {
        console.error("STT error:", sttError);
        return null; // Signal failure
      }),
      fetchKnowledgeContext(supabase, agentId).catch((kbErr: unknown) => {
        console.error("[KB] Error:", kbErr);
        return "";
      }),
    ]);

    // Handle STT failure or empty transcription
    if (sttResult === null) {
      return NextResponse.json(
        { error: "Speech-to-text failed." },
        { status: 500 }
      );
    }
    const transcribedText = sttResult;
    if (!transcribedText.trim()) {
      return NextResponse.json(
        { error: "Could not transcribe audio. Please try again." },
        { status: 400 }
      );
    }

    const knowledgeContext = knowledgeResult || "";

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .insert({
          agent_id: agentId,
          user_id: agent.user_id,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      convId = conversation?.id;
    }

    // Parallelize: save user message and fetch conversation history
    const [, historyResult] = await Promise.all([
      // Save user message (non-critical)
      convId
        ? Promise.resolve(supabase.from("messages").insert({
            conversation_id: convId,
            role: "user",
            content: transcribedText,
            tokens_used: 0,
            latency_ms: 0,
          })).then(() => undefined).catch((err: unknown) => {
            console.error("[PublicVoice] Error saving user message:", err);
          })
        : Promise.resolve(undefined),
      // Get conversation history
      Promise.resolve(supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })
        .limit(20)
      ).then((res) => res.data)
        .catch((err: unknown) => {
          console.error("[PublicVoice] Error fetching history:", err);
          return null;
        }),
    ]);

    const conversationHistory = (historyResult || [])
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: (m.role === "agent" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      }));

    // Build system prompt
    const basePrompt = agent.system_prompt || "You are a helpful assistant.";
    const knowledgeSection = knowledgeContext
      ? `\n\nKNOWLEDGE BASE:\n${knowledgeContext}\n\nUse the above knowledge base information to answer user questions accurately.`
      : "";
    const conversationalPrompt = `${basePrompt}${knowledgeSection}

IMPORTANT CONVERSATION GUIDELINES:
- You are a voice-first conversational AI agent. Keep responses natural, warm, and conversational.
- Use short, clear sentences suitable for spoken dialogue. Avoid long paragraphs.
- Do NOT use markdown formatting. Speak naturally as in a real phone conversation.
- Keep responses concise - aim for 2-4 sentences unless asked for details.
- Use a warm, friendly tone while staying professional.`;

    // Generate response
    const startTime = Date.now();
    const response = await generateAgentResponse({
      systemPrompt: conversationalPrompt,
      conversationHistory: conversationHistory.slice(0, -1),
      userMessage: transcribedText,
      model: agent.llm_model || "claude-sonnet-4",
      temperature: agent.temperature || 0.7,
    });
    const latencyMs = Date.now() - startTime;

    // Generate TTS
    let audioUrl: string | null = null;
    const voiceId = agent.voice_id || DEFAULT_VOICE_ID;
    try {
      const voiceSettings = agent.voice_settings as Record<string, number> | null;
      const ttsResponse = await textToSpeech(voiceId, response.text, {
        stability: voiceSettings?.stability,
        similarity_boost: voiceSettings?.similarity_boost,
        style: voiceSettings?.style,
        speed: voiceSettings?.speed,
      }, agent.language);
      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64 = Buffer.from(audioBuffer).toString("base64");
      audioUrl = `data:audio/mpeg;base64,${base64}`;
    } catch (ttsError) {
      console.error("TTS error:", ttsError);
    }

    // Save agent message
    if (convId) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "agent",
        content: response.text,
        tokens_used: response.inputTokens + response.outputTokens,
        latency_ms: latencyMs,
      });
    }

    return NextResponse.json({
      text: response.text,
      audio_url: audioUrl,
      conversation_id: convId,
      tokens_used: response.inputTokens + response.outputTokens,
      latency_ms: latencyMs,
      user_transcription: transcribedText,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Public voice chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
