import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createConversationalAgent,
  deleteConversationalAgent,
  updateElevenLabsPhoneNumber,
} from "@/lib/elevenlabs";

// POST /api/agents/[id]/deploy - Deploy agent to ElevenLabs
export async function POST(
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

    // Fetch the agent
    const { data: agent, error: fetchError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const oldElevenLabsId = agent.elevenlabs_agent_id;

    // Check if ElevenLabs API key is configured
    const hasElevenLabsKey = !!process.env.ELEVENLABS_API_KEY;

    if (hasElevenLabsKey && agent.voice_id) {
      // Deploy to ElevenLabs — create new agent first, then delete old one
      try {
        const elevenlabsAgent = await createConversationalAgent({
          name: agent.name,
          system_prompt: agent.system_prompt || "You are a helpful AI assistant.",
          first_message: agent.first_message || "Hello! How can I help you today?",
          voice_id: agent.voice_id,
          language: agent.language || "en",
          llm_model: agent.llm_model || undefined,
          temperature: agent.temperature || undefined,
          max_turns: agent.max_turns || undefined,
          voice_settings: agent.voice_settings || undefined,
        });

        // Update agent with ElevenLabs agent ID and set status to active
        const { data: updatedAgent, error: updateError } = await supabase
          .from("agents")
          .update({
            elevenlabs_agent_id: elevenlabsAgent.agent_id,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating agent after deployment:", updateError);
          return NextResponse.json(
            { error: "Agent deployed but failed to update local record" },
            { status: 500 }
          );
        }

        // Update any phone numbers assigned to this agent so they point
        // to the new ElevenLabs agent ID (important for re-deploys)
        const { data: assignedPhones } = await supabase
          .from("phone_numbers")
          .select("id, elevenlabs_phone_number_id")
          .eq("agent_id", id)
          .eq("user_id", user.id);

        if (assignedPhones && assignedPhones.length > 0) {
          await Promise.allSettled(
            assignedPhones.map(async (phone) => {
              if (phone.elevenlabs_phone_number_id) {
                try {
                  await updateElevenLabsPhoneNumber(
                    phone.elevenlabs_phone_number_id,
                    { agent_id: elevenlabsAgent.agent_id }
                  );
                  console.log("[Deploy] Updated phone number assignment:", {
                    phone_id: phone.id,
                    new_agent_id: elevenlabsAgent.agent_id,
                  });
                } catch (err) {
                  console.error("[Deploy] Failed to update phone number assignment:", err);
                }
              }
            })
          );
        }

        // Delete old ElevenLabs agent after successful creation of new one
        if (oldElevenLabsId) {
          try {
            await deleteConversationalAgent(oldElevenLabsId);
            console.log("[Deploy] Deleted old ElevenLabs agent:", oldElevenLabsId);
          } catch (err) {
            console.error("[Deploy] Failed to delete old ElevenLabs agent (non-fatal):", err);
          }
        }

        return NextResponse.json({
          agent: updatedAgent,
          elevenlabs_agent_id: elevenlabsAgent.agent_id,
          message: "Agent deployed successfully with ElevenLabs voice",
        });
      } catch (elevenLabsError) {
        console.error("ElevenLabs deployment failed:", elevenLabsError);
        // Fall through to deploy without ElevenLabs
      }
    }

    // Deploy without ElevenLabs (text-only mode or ElevenLabs unavailable)
    const { data: updatedAgent, error: updateError } = await supabase
      .from("agents")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating agent status:", updateError);
      return NextResponse.json(
        { error: "Failed to activate agent" },
        { status: 500 }
      );
    }

    const message = hasElevenLabsKey
      ? "Agent deployed (ElevenLabs integration failed, running in text mode)"
      : "Agent deployed in text mode. Add ELEVENLABS_API_KEY to enable voice.";

    return NextResponse.json({
      agent: updatedAgent,
      message,
    });
  } catch (error) {
    console.error("Error in POST /api/agents/[id]/deploy:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to deploy agent";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
