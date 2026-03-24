import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAgentResponse } from "@/lib/anthropic";
import { textToSpeech } from "@/lib/elevenlabs";
import { fetchKnowledgeContext } from "@/lib/knowledge";

// Default voice if agent doesn't have one configured
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversation_id } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch agent configuration (scoped to current user)
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          agent_id: agentId,
          user_id: user.id,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError) {
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }
      convId = conversation.id;
    }

    // Parallelize: save user message, fetch history, and fetch knowledge context
    const [, historyResult, knowledgeResult] = await Promise.all([
      // Save user message (non-critical — don't fail the whole batch)
      Promise.resolve(supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: message,
        tokens_used: 0,
        latency_ms: 0,
      })).then(() => undefined).catch((err: unknown) => {
        console.error("[Chat] Error saving user message:", err);
      }),
      // Get conversation history
      Promise.resolve(supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true })
        .limit(agent.max_turns * 2)
      ).then((res) => res.data)
        .catch((err: unknown) => {
          console.error("[Chat] Error fetching history:", err);
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
        role: (m.role === "agent" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: m.content,
      }));

    const knowledgeContext = knowledgeResult || "";

    // Build conversational system prompt
    const basePrompt = agent.system_prompt || "You are a helpful assistant.";
    const knowledgeSection = knowledgeContext
      ? `\n\nKNOWLEDGE BASE:\n${knowledgeContext}\n\nUse the above knowledge base information to answer user questions accurately. If the answer is in the knowledge base, use it. If not, use your general knowledge but mention you're not sure if it's specific to their context.`
      : "";
    const conversationalPrompt = `${basePrompt}${knowledgeSection}

IMPORTANT CONVERSATION GUIDELINES:
- You are a voice-first conversational AI agent. Keep responses natural, warm, and conversational.
- Use short, clear sentences suitable for spoken dialogue. Avoid long paragraphs.
- Do NOT use markdown formatting like ##, **, or bullet lists in your responses. Speak naturally as if you're having a real conversation.
- Ask follow-up questions to keep the conversation flowing.
- Show genuine interest in what the user is saying.
- If providing multiple points, number them naturally ("First... Second... Third...") instead of using bullet lists.
- Keep responses concise - aim for 2-4 sentences unless the user asks for detailed information.
- Use a warm, friendly tone while staying professional.`;

    // Generate response via Claude
    const startTime = Date.now();
    const response = await generateAgentResponse({
      systemPrompt: conversationalPrompt,
      conversationHistory: conversationHistory.slice(0, -1), // Exclude the message we just added
      userMessage: message,
      model: agent.llm_model || "claude-sonnet-4",
      temperature: agent.temperature || 0.7,
    });
    const latencyMs = Date.now() - startTime;

    // Generate TTS audio - use agent voice or default
    let audioUrl: string | null = null;
    const hasElevenLabsKey = !!process.env.ELEVENLABS_API_KEY;
    const voiceId = agent.voice_id || DEFAULT_VOICE_ID;

    if (hasElevenLabsKey) {
      try {
        // Strip markdown for cleaner TTS
        const plainText = response.text
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/- /g, ". ")
          .replace(/\n+/g, " ")
          .trim()
          .substring(0, 5000); // ElevenLabs limit

        const voiceSettings = agent.voice_settings as Record<string, number> | null;
        const ttsResponse = await textToSpeech(
          voiceId,
          plainText,
          {
            stability: voiceSettings?.stability,
            similarity_boost: voiceSettings?.similarity_boost,
            style: voiceSettings?.style,
            speed: voiceSettings?.speed,
          },
          agent.language
        );

        const audioBuffer = await ttsResponse.arrayBuffer();
        if (audioBuffer.byteLength > 0) {
          const base64 = Buffer.from(audioBuffer).toString("base64");
          audioUrl = `data:audio/mpeg;base64,${base64}`;
        } else {
          console.error("[TTS] Empty audio buffer received");
        }
      } catch (ttsError) {
        console.error("[TTS] Error:", ttsError);
        // Continue without audio
      }
    }

    // Parallelize post-response operations: save agent message, update conversation, update API count
    await Promise.all([
      // Save agent response
      Promise.resolve(supabase.from("messages").insert({
        conversation_id: convId,
        role: "agent",
        content: response.text,
        tokens_used: response.inputTokens + response.outputTokens,
        latency_ms: latencyMs,
      })).then(() => undefined).catch((err: unknown) => {
        console.error("[Chat] Error saving agent message:", err);
      }),
      // Update conversation stats
      Promise.resolve(supabase
        .from("conversations")
        .update({
          total_turns: (history?.length || 0) + 2,
          total_tokens:
            (conversationHistory.reduce((a, b) => a + (b.content?.length || 0), 0) / 4) +
            response.inputTokens +
            response.outputTokens,
        })
        .eq("id", convId)
      ).then(() => undefined).catch((err: unknown) => {
          console.error("[Chat] Error updating conversation stats:", err);
        }),
      // Update user API call count
      (async () => {
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("api_calls_used")
            .eq("id", user.id)
            .single();
          await supabase
            .from("users")
            .update({ api_calls_used: (profile?.api_calls_used || 0) + 1 })
            .eq("id", user.id);
        } catch {
          // Ignore if update fails
        }
      })(),
    ]);

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
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
