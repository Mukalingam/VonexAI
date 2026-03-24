import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/agents - List agents with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const domain = searchParams.get("domain") || "";
    const status = searchParams.get("status") || "";
    const channel = searchParams.get("channel") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 100);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("agents")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    // Apply search filter (escape special SQL pattern characters)
    if (search) {
      const escapedSearch = search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(
        `name.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`
      );
    }

    // Apply domain filter
    if (domain) {
      query = query.eq("domain", domain);
    }

    // Apply status filter
    if (status) {
      query = query.eq("status", status);
    }

    // Apply channel filter
    if (channel) {
      query = query.eq("agent_channel", channel);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: agents, count, error } = await query;

    if (error) {
      console.error("Error fetching agents:", error);
      return NextResponse.json(
        { error: "Failed to fetch agents" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      agents: agents || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in GET /api/agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.domain) {
      return NextResponse.json(
        { error: "Name and domain are required" },
        { status: 400 }
      );
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

    // Create agent
    const agentData = {
      user_id: user.id,
      name: body.name,
      description: body.description || null,
      domain: body.domain,
      agent_type: body.agent_type || "general",
      agent_channel: body.agent_channel || "website",
      status: "draft" as const,
      personality_traits: body.personality_traits || {
        traits: ["professional"],
        response_style: "conversational",
      },
      system_prompt: body.system_prompt || "",
      first_message: body.first_message || "",
      voice_id: body.voice_id || null,
      voice_gender: body.voice_gender || null,
      language: body.language || "en",
      voice_settings: body.voice_settings || null,
      llm_model: body.llm_model || "claude-sonnet-4",
      temperature: body.temperature ?? 0.7,
      max_turns: body.max_turns ?? 50,
      webhook_url: body.webhook_url || null,
      advanced_settings: body.advanced_settings || null,
    };

    const { data: agent, error } = await supabase
      .from("agents")
      .insert(agentData)
      .select()
      .single();

    if (error) {
      console.error("Error creating agent:", error);
      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: 500 }
      );
    }

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
