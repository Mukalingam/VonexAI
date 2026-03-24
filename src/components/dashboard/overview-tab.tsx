"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Activity,
  MessageSquare,
  Zap,
  PlusCircle,
  BarChart3,
  Clock,
  Sparkles,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Megaphone,
  MonitorSmartphone,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "./charts/stat-card";

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface ActivityItem {
  id: string;
  type: "agent_created" | "agent_tested" | "agent_deployed" | "agent_updated" | "call_completed" | "campaign_launched";
  label: string;
  created_at: string;
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "agent_created":
      return <PlusCircle className="h-4 w-4 text-amber-500" />;
    case "agent_tested":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "agent_deployed":
      return <Activity className="h-4 w-4 text-emerald-500" />;
    case "agent_updated":
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    case "call_completed":
      return <Phone className="h-4 w-4 text-orange-500" />;
    case "campaign_launched":
      return <Megaphone className="h-4 w-4 text-amber-500" />;
  }
}

const callStatusColors: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  no_answer: "bg-amber-50 text-amber-700 border-amber-200",
  initiated: "bg-gray-50 text-gray-700 border-gray-200",
  ringing: "bg-blue-50 text-blue-700 border-blue-200",
  busy: "bg-orange-50 text-orange-700 border-orange-200",
};

export interface OverviewData {
  displayName: string;
  totalAgents: number;
  activeAgents: number;
  websiteAgents: number;
  callingAgents: number;
  totalConversations: number;
  totalCalls: number;
  completedCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  avgDuration: number;
  totalDuration: number;
  callSuccessRate: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  planTier: string;
  activityItems: ActivityItem[];
  recentCalls: {
    id: string;
    direction: string;
    status: string;
    from_number: string | null;
    to_number: string | null;
    duration_seconds: number;
    started_at: string;
    agent_name: string | null;
  }[];
  campaigns: {
    id: string;
    name: string;
    status: string;
    total_contacts: number;
    completed_calls: number;
  }[];
}

export function OverviewTab({ data }: { data: OverviewData }) {
  const firstName = data.displayName.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">
                Welcome back, {firstName}!
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Here is what is happening with your voice agents today.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/agents/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Agent
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2 text-sm">
              <MonitorSmartphone className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">
                {data.websiteAgents} website agent{data.websiteAgents !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2 text-sm">
              <Phone className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">
                {data.callingAgents} calling agent{data.callingAgents !== 1 ? "s" : ""}
              </span>
            </div>
            {data.totalCalls > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">
                  {data.callSuccessRate}% call success rate
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Agents"
          value={data.totalAgents}
          icon={<Bot className="h-4 w-4 text-muted-foreground" />}
          description={`${data.websiteAgents} web, ${data.callingAgents} calling`}
        />
        <StatCard
          title="Active Agents"
          value={data.activeAgents}
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
          description="Currently deployed"
        />
        <StatCard
          title="Conversations"
          value={data.totalConversations}
          icon={<MessageSquare className="h-4 w-4 text-blue-500" />}
          description="Website voice sessions"
        />
        <StatCard
          title="API Usage"
          value={`${data.apiCallsUsed.toLocaleString()} / ${data.apiCallsLimit.toLocaleString()}`}
          icon={<Zap className="h-4 w-4 text-amber-500" />}
          description="This billing period"
        />
      </div>

      {/* Call Stats Row */}
      {data.totalCalls > 0 && (
        <>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Phone Calls</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Calls"
              value={data.totalCalls}
              icon={<Phone className="h-4 w-4 text-orange-500" />}
              description={`${data.inboundCalls} in, ${data.outboundCalls} out`}
            />
            <StatCard
              title="Completed"
              value={data.completedCalls}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              trend={{ value: `${data.callSuccessRate}%`, positive: data.callSuccessRate >= 50 }}
              description="success rate"
            />
            <StatCard
              title="Avg Duration"
              value={formatDuration(data.avgDuration)}
              icon={<Clock className="h-4 w-4 text-blue-500" />}
              description="Per completed call"
            />
            <StatCard
              title="Total Talk Time"
              value={formatDuration(data.totalDuration)}
              icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
              description="All completed calls"
            />
          </div>
        </>
      )}

      {/* Bottom section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest actions, calls, and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {data.activityItems.length > 0 ? (
              <div className="space-y-3">
                {data.activityItems.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.label}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(item.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-medium">No activity yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first agent to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/agents/new">
                  <PlusCircle className="mr-3 h-4 w-4 text-primary" />
                  Create New Agent
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/campaigns/new">
                  <Megaphone className="mr-3 h-4 w-4 text-orange-500" />
                  Launch Campaign
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/calls">
                  <Phone className="mr-3 h-4 w-4 text-emerald-500" />
                  View Call Logs
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/analytics">
                  <BarChart3 className="mr-3 h-4 w-4 text-blue-500" />
                  View Analytics
                </Link>
              </Button>
              <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Plan</span>
                  <Badge
                    variant={data.planTier === "free" ? "secondary" : "default"}
                  >
                    {data.planTier.charAt(0).toUpperCase() + data.planTier.slice(1)}
                  </Badge>
                </div>
                {data.planTier === "free" && (
                  <Button asChild size="sm" className="mt-3 w-full" variant="default">
                    <Link href="/billing">Upgrade Plan</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {data.campaigns.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Campaigns</CardTitle>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/campaigns">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.campaigns.map((campaign) => {
                  const progress = campaign.total_contacts > 0
                    ? Math.round((campaign.completed_calls / campaign.total_contacts) * 100)
                    : 0;
                  return (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}`}
                      className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{campaign.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {campaign.completed_calls}/{campaign.total_contacts}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Calls Table */}
      {data.recentCalls.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Calls</CardTitle>
                <CardDescription>Latest phone call activity</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/calls">View All Calls</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Direction</th>
                    <th className="pb-3 pr-4 font-medium">Agent</th>
                    <th className="pb-3 pr-4 font-medium">Number</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCalls.map((call) => {
                    const phoneNum = call.direction === "inbound" ? call.from_number : call.to_number;
                    return (
                      <tr key={call.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {call.direction === "inbound" ? (
                              <PhoneIncoming className="h-4 w-4 text-blue-500" />
                            ) : (
                              <PhoneOutgoing className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-sm capitalize">{call.direction}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm">{call.agent_name || "\u2014"}</td>
                        <td className="py-3 pr-4 text-sm font-mono text-muted-foreground">{phoneNum || "\u2014"}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${callStatusColors[call.status] || ""}`}
                          >
                            {call.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {call.duration_seconds > 0 ? formatDuration(call.duration_seconds) : "\u2014"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {formatRelativeTime(call.started_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
