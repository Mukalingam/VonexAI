import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/calls/analytics - Aggregated call statistics
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
    const days = parseInt(searchParams.get("days") || "30", 10);
    const agentId = searchParams.get("agent_id");

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Total calls
    let totalQuery = supabase
      .from("call_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("started_at", dateFrom.toISOString());

    if (agentId) totalQuery = totalQuery.eq("agent_id", agentId);

    const { count: totalCalls } = await totalQuery;

    // Completed calls
    let completedQuery = supabase
      .from("call_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("started_at", dateFrom.toISOString());

    if (agentId) completedQuery = completedQuery.eq("agent_id", agentId);

    const { count: completedCalls } = await completedQuery;

    // Get all completed calls for duration calculation
    let durationQuery = supabase
      .from("call_logs")
      .select("duration_seconds")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("started_at", dateFrom.toISOString())
      .gt("duration_seconds", 0);

    if (agentId) durationQuery = durationQuery.eq("agent_id", agentId);

    const { data: durationData } = await durationQuery;

    const totalDuration = (durationData || []).reduce(
      (sum, c) => sum + (c.duration_seconds || 0),
      0
    );
    const avgDuration =
      durationData && durationData.length > 0
        ? Math.round(totalDuration / durationData.length)
        : 0;

    // Calls by direction
    let inboundQuery = supabase
      .from("call_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("direction", "inbound")
      .gte("started_at", dateFrom.toISOString());

    if (agentId) inboundQuery = inboundQuery.eq("agent_id", agentId);

    const { count: inboundCalls } = await inboundQuery;

    // Failed calls
    let failedQuery = supabase
      .from("call_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "failed")
      .gte("started_at", dateFrom.toISOString());

    if (agentId) failedQuery = failedQuery.eq("agent_id", agentId);

    const { count: failedCalls } = await failedQuery;

    const successRate =
      totalCalls && totalCalls > 0
        ? Math.round(((completedCalls || 0) / totalCalls) * 100)
        : 0;

    return NextResponse.json({
      period_days: days,
      total_calls: totalCalls || 0,
      completed_calls: completedCalls || 0,
      failed_calls: failedCalls || 0,
      inbound_calls: inboundCalls || 0,
      outbound_calls: (totalCalls || 0) - (inboundCalls || 0),
      total_duration_seconds: totalDuration,
      avg_duration_seconds: avgDuration,
      success_rate: successRate,
    });
  } catch (error) {
    console.error("Error in GET /api/calls/analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
