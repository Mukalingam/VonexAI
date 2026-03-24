import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/agents/[id]/duplicate - Duplicate an agent
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

    // Fetch the original agent
    const { data: originalAgent, error: fetchError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !originalAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check agent limit based on plan
    const { data: profile } = await supabase
      .from("users")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    const planLimits: Record<string, number> = {
      free: 3,
      pro: 25,
      enterprise: 999,
    };

    const maxAgents = planLimits[profile?.plan_tier || "free"] || 3;

    const { count: currentAgents } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((currentAgents || 0) >= maxAgents) {
      return NextResponse.json(
        {
          error: `Agent limit reached. Your ${profile?.plan_tier || "free"} plan allows up to ${maxAgents} agents. Please upgrade to create more.`,
        },
        { status: 403 }
      );
    }

    // Create the duplicate - reset deployment-specific fields
    const duplicateData = {
      user_id: user.id,
      name: `${originalAgent.name} (Copy)`,
      description: originalAgent.description,
      domain: originalAgent.domain,
      agent_type: originalAgent.agent_type,
      status: "draft" as const,
      personality_traits: originalAgent.personality_traits,
      system_prompt: originalAgent.system_prompt,
      first_message: originalAgent.first_message,
      voice_id: originalAgent.voice_id,
      voice_gender: originalAgent.voice_gender,
      language: originalAgent.language,
      voice_settings: originalAgent.voice_settings,
      llm_model: originalAgent.llm_model,
      temperature: originalAgent.temperature,
      max_turns: originalAgent.max_turns,
      webhook_url: originalAgent.webhook_url,
      advanced_settings: originalAgent.advanced_settings,
      // Do NOT copy elevenlabs_agent_id - duplicate starts as a draft
      elevenlabs_agent_id: null,
    };

    const { data: duplicatedAgent, error: insertError } = await supabase
      .from("agents")
      .insert(duplicateData)
      .select()
      .single();

    if (insertError) {
      console.error("Error duplicating agent:", insertError);
      return NextResponse.json(
        { error: "Failed to duplicate agent" },
        { status: 500 }
      );
    }

    return NextResponse.json(duplicatedAgent, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/agents/[id]/duplicate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
