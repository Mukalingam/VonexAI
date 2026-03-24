import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("users")
      .select("api_calls_used, api_calls_limit")
      .eq("id", user.id)
      .single();

    // Fetch agent counts
    const { data: agents } = await supabase
      .from("agents")
      .select("id, name, status")
      .eq("user_id", user.id);

    const totalAgents = agents?.length || 0;
    const activeAgents =
      agents?.filter((a) => a.status === "active").length || 0;

    // Fetch conversation stats
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, agent_id, total_turns, total_tokens, status, started_at, duration_seconds")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    const totalConversations = conversations?.length || 0;

    const conversationIds = (conversations || []).map((c) => c.id);

    // Fetch message stats, latency, and ratings (guard against empty array for .in())
    let totalMessages = 0;
    let latencyData: { latency_ms: number }[] | null = null;
    let ratingsData: { rating: number | null }[] | null = null;

    if (conversationIds.length > 0) {
      const [messagesResult, latencyResult, ratingsResult] = await Promise.all([
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .in("conversation_id", conversationIds),
        supabase
          .from("messages")
          .select("latency_ms")
          .eq("role", "agent")
          .in("conversation_id", conversationIds)
          .gt("latency_ms", 0),
        supabase
          .from("messages")
          .select("rating")
          .in("conversation_id", conversationIds)
          .not("rating", "is", null),
      ]);
      totalMessages = messagesResult.count || 0;
      latencyData = latencyResult.data;
      ratingsData = ratingsResult.data;
    }

    const avgResponseTime = latencyData?.length
      ? Math.round(
          latencyData.reduce((sum, m) => sum + m.latency_ms, 0) /
            latencyData.length
        )
      : 0;

    const avgSatisfaction = ratingsData?.length
      ? ratingsData.reduce((sum, m) => sum + (m.rating || 0), 0) /
        ratingsData.length /
        5
      : 0;

    // Top agents by conversation count
    const agentConvCounts: Record<string, number> = {};
    (conversations || []).forEach((c) => {
      agentConvCounts[c.agent_id] =
        (agentConvCounts[c.agent_id] || 0) + 1;
    });

    const topAgents = (agents || [])
      .map((a) => ({
        id: a.id,
        name: a.name,
        conversations: agentConvCounts[a.id] || 0,
        avg_rating: 0,
      }))
      .sort((a, b) => b.conversations - a.conversations)
      .slice(0, 5);

    // Recent conversations with agent names
    const recentConversations = (conversations || []).slice(0, 10).map((c) => {
      const agent = agents?.find((a) => a.id === c.agent_id);
      return {
        id: c.id,
        agent_name: agent?.name || "Unknown Agent",
        total_turns: c.total_turns,
        status: c.status,
        started_at: c.started_at,
      };
    });

    return NextResponse.json({
      totalAgents,
      activeAgents,
      totalConversations,
      totalMessages: totalMessages || 0,
      avgResponseTime,
      avgSatisfaction,
      apiCallsUsed: profile?.api_calls_used || 0,
      apiCallsLimit: profile?.api_calls_limit || 100,
      topAgents,
      recentConversations,
    }, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
