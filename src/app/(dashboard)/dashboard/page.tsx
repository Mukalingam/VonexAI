import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import type { OverviewData } from "@/components/dashboard/overview-tab";
import type { WebsiteAgentsData } from "@/components/dashboard/website-agents-tab";
import type { CallingAgentsData } from "@/components/dashboard/calling-agents-tab";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface ActivityItem {
  id: string;
  type: "agent_created" | "agent_tested" | "agent_deployed" | "agent_updated" | "call_completed" | "campaign_launched";
  label: string;
  created_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // Calculate 30 days ago for time-scoped queries
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  // Fetch all data in parallel for performance
  const [
    profileResult,
    totalAgentsResult,
    activeAgentsResult,
    websiteAgentsCountResult,
    callingAgentsCountResult,
    totalConversationsResult,
    totalCallsResult,
    completedCallsResult,
    inboundCallsResult,
    recentAgentsResult,
    recentCallsResult,
    campaignsResult,
    callDurationsResult,
    // Website tab data
    websiteAgentsResult,
    activeWebsiteAgentsResult,
    websiteConversationsResult,
    websiteLatencyResult,
    // Calling tab data
    callingAgentsListResult,
    callLogsRecentResult,
  ] = await Promise.all([
    // Overview data
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("agents").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("agents").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
    supabase.from("agents").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("agent_channel", "website"),
    supabase.from("agents").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("agent_channel", "calling"),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("call_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("call_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
    supabase.from("call_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("direction", "inbound"),
    supabase.from("agents").select("id, name, status, agent_channel, created_at, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(5),
    supabase.from("call_logs").select("id, agent_id, direction, status, from_number, to_number, duration_seconds, started_at, agents(name)").eq("user_id", user.id).order("started_at", { ascending: false }).limit(10),
    supabase.from("campaigns").select("id, name, status, total_contacts, completed_calls, successful_calls, failed_calls, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("call_logs").select("duration_seconds").eq("user_id", user.id).eq("status", "completed").gt("duration_seconds", 0),
    // Website tab: all website agents with details
    supabase.from("agents").select("id, name, status, domain").eq("user_id", user.id).eq("agent_channel", "website"),
    supabase.from("agents").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("agent_channel", "website").eq("status", "active"),
    // Website tab: conversations from last 30 days
    supabase.from("conversations").select("id, agent_id, total_turns, status, started_at, agents(name)").eq("user_id", user.id).gte("started_at", thirtyDaysAgoISO).order("started_at", { ascending: false }).limit(500),
    // Website tab: average latency from recent messages
    supabase.from("messages").select("latency_ms, conversation_id").eq("role", "agent").gt("latency_ms", 0).limit(200),
    // Calling tab: calling agents with details
    supabase.from("agents").select("id, name, status, domain").eq("user_id", user.id).eq("agent_channel", "calling"),
    // Calling tab: call logs from last 30 days with full details
    supabase.from("call_logs").select("id, agent_id, direction, status, from_number, to_number, duration_seconds, started_at, metadata, agents(name)").eq("user_id", user.id).gte("started_at", thirtyDaysAgoISO).order("started_at", { ascending: false }).limit(500),
  ]);

  const profile = profileResult.data;
  const totalAgents = totalAgentsResult.count || 0;
  const activeAgents = activeAgentsResult.count || 0;
  const websiteAgentsCount = websiteAgentsCountResult.count || 0;
  const callingAgentsCount = callingAgentsCountResult.count || 0;
  const totalConversations = totalConversationsResult.count || 0;
  const totalCalls = totalCallsResult.count || 0;
  const completedCalls = completedCallsResult.count || 0;
  const inboundCalls = inboundCallsResult.count || 0;
  const outboundCalls = totalCalls - inboundCalls;
  const recentAgents = recentAgentsResult.data || [];
  const recentCalls = recentCallsResult.data || [];
  const campaigns = campaignsResult.data || [];

  // Calculate avg duration
  const durations = callDurationsResult.data || [];
  const totalDuration = durations.reduce((sum: number, c: { duration_seconds: number }) => sum + (c.duration_seconds || 0), 0);
  const avgDuration = durations.length > 0 ? Math.round(totalDuration / durations.length) : 0;
  const callSuccessRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  // Build activity items
  const activityItems: ActivityItem[] = recentAgents.map((agent: { id: string; name: string; status: string; agent_channel: string; created_at: string; updated_at: string }) => {
    let type: ActivityItem["type"] = "agent_created";
    if (agent.status === "active") type = "agent_deployed";
    else if (agent.updated_at !== agent.created_at) type = "agent_updated";
    return {
      id: agent.id,
      type,
      label: `${type === "agent_created" ? "Created" : type === "agent_deployed" ? "Deployed" : "Updated"} agent "${agent.name}"`,
      created_at: agent.updated_at,
    };
  });

  recentCalls.slice(0, 5).forEach((call: { id: string; direction: string; status: string; started_at: string; agents: { name: string } | { name: string }[] | null }) => {
    const agentName = Array.isArray(call.agents) ? call.agents[0]?.name : call.agents?.name;
    activityItems.push({
      id: `call-${call.id}`,
      type: "call_completed",
      label: `${call.direction === "inbound" ? "Inbound" : "Outbound"} call ${call.status === "completed" ? "completed" : call.status}${agentName ? ` via ${agentName}` : ""}`,
      created_at: call.started_at,
    });
  });

  activityItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const displayName = profile?.full_name || user.user_metadata?.full_name || "there";

  // Format recent calls for overview
  const formattedRecentCalls = recentCalls.slice(0, 5).map((call: { id: string; direction: string; status: string; from_number: string | null; to_number: string | null; duration_seconds: number; started_at: string; agents: { name: string } | { name: string }[] | null }) => {
    const agentName = Array.isArray(call.agents) ? call.agents[0]?.name : call.agents?.name;
    return {
      id: call.id,
      direction: call.direction,
      status: call.status,
      from_number: call.from_number,
      to_number: call.to_number,
      duration_seconds: call.duration_seconds,
      started_at: call.started_at,
      agent_name: agentName || null,
    };
  });

  // ========== Website Tab Aggregations ==========
  const websiteAgents = websiteAgentsResult.data || [];
  const activeWebsiteAgents = activeWebsiteAgentsResult.count || 0;
  const websiteConversations = websiteConversationsResult.data || [];
  const latencyMessages = websiteLatencyResult.data || [];

  // Conversations by day (last 30 days)
  const convByDayMap: Record<string, number> = {};
  websiteConversations.forEach((c: { started_at: string }) => {
    const day = c.started_at?.slice(0, 10);
    if (day) convByDayMap[day] = (convByDayMap[day] || 0) + 1;
  });
  const conversationsByDay = Object.entries(convByDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Agent performance
  const agentConvCount: Record<string, number> = {};
  websiteConversations.forEach((c: { agent_id: string }) => {
    agentConvCount[c.agent_id] = (agentConvCount[c.agent_id] || 0) + 1;
  });
  const agentPerformance = websiteAgents
    .map((a: { id: string; name: string }) => ({
      name: a.name,
      conversations: agentConvCount[a.id] || 0,
      avgRating: 0,
    }))
    .sort((a: { conversations: number }, b: { conversations: number }) => b.conversations - a.conversations)
    .slice(0, 8);

  // Domain distribution
  const domainCount: Record<string, number> = {};
  websiteAgents.forEach((a: { domain: string }) => {
    const d = a.domain || "custom";
    domainCount[d] = (domainCount[d] || 0) + 1;
  });
  const domainDistribution = Object.entries(domainCount)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);

  // Conversation status distribution
  const statusCount: Record<string, number> = {};
  websiteConversations.forEach((c: { status: string }) => {
    const s = c.status || "unknown";
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const statusDistribution = Object.entries(statusCount)
    .map(([status, count]) => ({ status, count }));

  // Average response time
  const avgResponseTime = latencyMessages.length > 0
    ? Math.round(latencyMessages.reduce((sum: number, m: { latency_ms: number }) => sum + m.latency_ms, 0) / latencyMessages.length)
    : 0;

  // Recent website conversations
  const recentWebConversations = websiteConversations.slice(0, 10).map((c: { id: string; total_turns: number; status: string; started_at: string; agents: { name: string } | { name: string }[] | null }) => {
    const agentName = Array.isArray(c.agents) ? c.agents[0]?.name : c.agents?.name;
    return {
      id: c.id,
      agent_name: agentName || "Unknown",
      total_turns: c.total_turns || 0,
      status: c.status,
      started_at: c.started_at,
    };
  });

  // ========== Calling Tab Aggregations ==========
  const callingAgentsList = callingAgentsListResult.data || [];
  const callLogsRecent = callLogsRecentResult.data || [];

  // Calls by day (inbound vs outbound)
  const callsByDayMap: Record<string, { inbound: number; outbound: number }> = {};
  callLogsRecent.forEach((c: { started_at: string; direction: string }) => {
    const day = c.started_at?.slice(0, 10);
    if (day) {
      if (!callsByDayMap[day]) callsByDayMap[day] = { inbound: 0, outbound: 0 };
      if (c.direction === "inbound") callsByDayMap[day].inbound++;
      else callsByDayMap[day].outbound++;
    }
  });
  const callsByDay = Object.entries(callsByDayMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Call status distribution
  const callStatusCount: Record<string, number> = {};
  callLogsRecent.forEach((c: { status: string }) => {
    const s = c.status || "unknown";
    callStatusCount[s] = (callStatusCount[s] || 0) + 1;
  });
  const callStatusDistribution = Object.entries(callStatusCount)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Duration distribution (buckets)
  const durationBuckets = { "0-30s": 0, "30s-1m": 0, "1-2m": 0, "2-5m": 0, "5m+": 0 };
  callLogsRecent.forEach((c: { duration_seconds: number; status: string }) => {
    if (c.status !== "completed" || !c.duration_seconds) return;
    const d = c.duration_seconds;
    if (d <= 30) durationBuckets["0-30s"]++;
    else if (d <= 60) durationBuckets["30s-1m"]++;
    else if (d <= 120) durationBuckets["1-2m"]++;
    else if (d <= 300) durationBuckets["2-5m"]++;
    else durationBuckets["5m+"]++;
  });
  const durationDistribution = Object.entries(durationBuckets)
    .map(([bucket, count]) => ({ bucket, count }));

  // Sentiment distribution (from metadata if available)
  const sentimentCount: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
  callLogsRecent.forEach((c: { metadata: { call_successful?: boolean } | null; status: string }) => {
    if (c.status !== "completed") return;
    if (c.metadata?.call_successful === true) sentimentCount.positive++;
    else if (c.metadata?.call_successful === false) sentimentCount.negative++;
    else sentimentCount.neutral++;
  });
  const sentimentDistribution = Object.entries(sentimentCount)
    .filter(([, count]) => count > 0)
    .map(([sentiment, count]) => ({ sentiment, count }));

  // Peak hours
  const hourCount: Record<number, number> = {};
  callLogsRecent.forEach((c: { started_at: string }) => {
    const hour = new Date(c.started_at).getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  });
  const peakHours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourCount[i] || 0,
  }));

  // Agent leaderboard
  const agentCallCount: Record<string, number> = {};
  const agentSuccessCount: Record<string, number> = {};
  callLogsRecent.forEach((c: { agent_id: string; status: string }) => {
    agentCallCount[c.agent_id] = (agentCallCount[c.agent_id] || 0) + 1;
    if (c.status === "completed") agentSuccessCount[c.agent_id] = (agentSuccessCount[c.agent_id] || 0) + 1;
  });
  const agentLeaderboard = callingAgentsList
    .map((a: { id: string; name: string }) => ({
      name: a.name,
      calls: agentCallCount[a.id] || 0,
      successRate: agentCallCount[a.id] ? Math.round(((agentSuccessCount[a.id] || 0) / agentCallCount[a.id]) * 100) : 0,
    }))
    .sort((a: { calls: number }, b: { calls: number }) => b.calls - a.calls)
    .slice(0, 8);

  // Recent calls for calling tab
  const callingRecentCalls = callLogsRecent.slice(0, 10).map((call: { id: string; direction: string; status: string; from_number: string | null; to_number: string | null; duration_seconds: number; started_at: string; agents: { name: string } | { name: string }[] | null }) => {
    const agentName = Array.isArray(call.agents) ? call.agents[0]?.name : call.agents?.name;
    return {
      id: call.id,
      direction: call.direction,
      status: call.status,
      from_number: call.from_number,
      to_number: call.to_number,
      duration_seconds: call.duration_seconds,
      started_at: call.started_at,
      agent_name: agentName || null,
    };
  });

  // Campaigns for calling tab
  const callingCampaigns = campaigns.map((c: { id: string; name: string; status: string; total_contacts: number; completed_calls: number; successful_calls: number }) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    total: c.total_contacts,
    completed: c.completed_calls,
    successful: c.successful_calls,
  }));

  // Calling tab computed totals from recent data
  const callingTotalCalls = callLogsRecent.length;
  const callingCompletedCalls = callLogsRecent.filter((c: { status: string }) => c.status === "completed").length;
  const callingSuccessRate = callingTotalCalls > 0 ? Math.round((callingCompletedCalls / callingTotalCalls) * 100) : 0;
  const callingDurations = callLogsRecent.filter((c: { status: string; duration_seconds: number }) => c.status === "completed" && c.duration_seconds > 0);
  const callingTotalTalkTime = callingDurations.reduce((sum: number, c: { duration_seconds: number }) => sum + c.duration_seconds, 0);
  const callingAvgDuration = callingDurations.length > 0 ? Math.round(callingTotalTalkTime / callingDurations.length) : 0;

  // ========== Build Props ==========
  const overviewData: OverviewData = {
    displayName,
    totalAgents,
    activeAgents,
    websiteAgents: websiteAgentsCount,
    callingAgents: callingAgentsCount,
    totalConversations,
    totalCalls,
    completedCalls,
    inboundCalls,
    outboundCalls,
    avgDuration,
    totalDuration,
    callSuccessRate,
    apiCallsUsed: profile?.api_calls_used || 0,
    apiCallsLimit: profile?.api_calls_limit || 1000,
    planTier: profile?.plan_tier || "free",
    activityItems,
    recentCalls: formattedRecentCalls,
    campaigns: campaigns.map((c: { id: string; name: string; status: string; total_contacts: number; completed_calls: number }) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      total_contacts: c.total_contacts,
      completed_calls: c.completed_calls,
    })),
  };

  const websiteData: WebsiteAgentsData = {
    totalAgents: websiteAgentsCount,
    activeAgents: activeWebsiteAgents,
    totalConversations: websiteConversations.length,
    avgResponseTime,
    conversationsByDay,
    agentPerformance,
    domainDistribution,
    statusDistribution,
    recentConversations: recentWebConversations,
  };

  const callingData: CallingAgentsData = {
    totalCalls: callingTotalCalls,
    completedCalls: callingCompletedCalls,
    successRate: callingSuccessRate,
    avgDuration: callingAvgDuration,
    totalTalkTime: callingTotalTalkTime,
    callsByDay,
    callStatusDistribution,
    durationDistribution,
    sentimentDistribution,
    peakHours,
    agentLeaderboard,
    campaigns: callingCampaigns,
    recentCalls: callingRecentCalls,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTabs
        overview={overviewData}
        websiteData={websiteData}
        callingData={callingData}
      />
    </div>
  );
}
