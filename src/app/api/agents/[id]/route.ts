import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateConversationalAgent } from "@/lib/elevenlabs";

// GET /api/agents/[id] - Get a single agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error in GET /api/agents/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id] - Update an agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the agent belongs to the user and get current data
    const { data: existingAgent } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      "name",
      "description",
      "domain",
      "agent_type",
      "status",
      "personality_traits",
      "system_prompt",
      "first_message",
      "voice_id",
      "voice_gender",
      "language",
      "voice_settings",
      "llm_model",
      "temperature",
      "max_turns",
      "webhook_url",
      "advanced_settings",
      "is_public",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: agent, error } = await supabase
      .from("agents")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating agent:", error);
      return NextResponse.json(
        { error: "Failed to update agent" },
        { status: 500 }
      );
    }

    // Sync config changes to ElevenLabs if agent is deployed
    if (existingAgent.elevenlabs_agent_id) {
      const elevenlabsFields = [
        "name", "system_prompt", "first_message", "voice_id",
        "language", "llm_model", "temperature", "max_turns", "voice_settings",
      ];
      const hasElevenLabsChange = elevenlabsFields.some(
        (f) => body[f] !== undefined
      );

      if (hasElevenLabsChange) {
        try {
          const merged = { ...existingAgent, ...updateData };
          const language = (merged.language as string) || "en";
          const ttsModel = language === "en" ? "eleven_turbo_v2" : "eleven_multilingual_v2";
          const vs = (merged.voice_settings as Record<string, number> | null) || {};

          await updateConversationalAgent(
            existingAgent.elevenlabs_agent_id,
            {
              name: merged.name as string,
              conversation_config: {
                agent: {
                  prompt: {
                    prompt: merged.system_prompt || "You are a helpful AI assistant.",
                    temperature: (merged.temperature as number) ?? 0.7,
                  },
                  first_message: merged.first_message || "Hello! How can I help you today?",
                  language,
                },
                tts: {
                  voice_id: merged.voice_id,
                  model_id: ttsModel,
                  stability: vs.stability ?? 0.5,
                  similarity_boost: vs.similarity_boost ?? 0.75,
                  speed: vs.speed ?? 1,
                  optimize_streaming_latency: 3,
                },
                turn: {
                  turn_timeout: 30,
                  silence_end_call_timeout: 60,
                },
                conversation: {
                  max_duration_seconds: merged.max_turns
                    ? (merged.max_turns as number) * 60
                    : 1800,
                },
              },
            }
          );
        } catch (syncError) {
          console.error("Failed to sync agent to ElevenLabs:", syncError);
          // Don't fail the local update — return success with a warning
        }
      }
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error in PATCH /api/agents/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the agent belongs to the user and get its data
    const { data: agent } = await supabase
      .from("agents")
      .select("id, elevenlabs_agent_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // If agent was deployed to ElevenLabs, clean up
    if (agent.elevenlabs_agent_id) {
      try {
        const { deleteConversationalAgent } = await import(
          "@/lib/elevenlabs"
        );
        await deleteConversationalAgent(agent.elevenlabs_agent_id);
      } catch (err) {
        console.error("Failed to delete ElevenLabs agent:", err);
        // Continue with local deletion even if ElevenLabs cleanup fails
      }
    }

    // Delete related conversations first (cascade)
    await supabase.from("conversations").delete().eq("agent_id", id);

    // Delete related knowledge base entries
    await supabase.from("knowledge_bases").delete().eq("agent_id", id);

    // Delete the agent
    const { error } = await supabase
      .from("agents")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting agent:", error);
      return NextResponse.json(
        { error: "Failed to delete agent" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/agents/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
