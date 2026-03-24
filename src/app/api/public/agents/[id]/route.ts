import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/server";

// GET /api/public/agents/[id] - Fetch a public agent (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAnonClient();

    const { data: agent, error } = await supabase
      .from("agents")
      .select("id, name, description, domain, agent_type, agent_channel, first_message, language, voice_id, voice_gender, voice_settings, status, is_public, elevenlabs_agent_id")
      .eq("id", id)
      .eq("is_public", true)
      .eq("status", "active")
      .single();

    if (error || !agent) {
      return NextResponse.json(
        { error: "Agent not found or not publicly accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json(agent, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Public agent fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
