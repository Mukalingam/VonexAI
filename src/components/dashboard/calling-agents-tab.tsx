"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  CheckCircle2,
  TrendingUp,
  Clock,
  Timer,
  Users,
  BarChart3,
  Activity,
  Flame,
  Snowflake,
  Loader2,
  Sparkles,
  ThermometerSun,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_PALETTE, VONEX_COLORS, STATUS_COLORS, SENTIMENT_COLORS, LEAD_COLORS, ENGAGEMENT_COLORS } from "./charts/chart-colors";

export interface CallingAgentsData {
  totalCalls: number;
  completedCalls: number;
  successRate: number;
  avgDuration: number;
  totalTalkTime: number;
  callsByDay: { date: string; inbound: number; outbound: number }[];
  callStatusDistribution: { status: string; count: number }[];
  durationDistribution: { bucket: string; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
  peakHours: { hour: number; count: number }[];
  agentLeaderboard: { name: string; calls: number; successRate: number }[];
  campaigns: { id: string; name: string; status: string; total: number; completed: number; successful: number }[];
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
}

interface AIAnalytics {
  analyzed_calls: number;
  sentiment_distribution: { sentiment: string; count: number }[];
  lead_distribution: { temperature: string; count: number }[];
  engagement_distribution: { level: string; count: number }[];
  hot_leads: {
    id: string;
    to_number: string | null;
    from_number: string | null;
    agent_name: string | null;
    lead_score: number;
    summary: string;
    started_at: string;
    contact_name?: string;
  }[];
  cold_leads: {
    id: string;
    to_number: string | null;
    from_number: string | null;
    agent_name: string | null;
    lead_score: number;
    summary: string;
    started_at: string;
    contact_name?: string;
  }[];
  avg_sentiment: number;
  avg_lead_score: number;
  top_topics: { topic: string; count: number }[];
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

const callStatusBadge: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-blue-50 text-blue-700",
  failed: "bg-red-50 text-red-700",
  no_answer: "bg-amber-50 text-amber-700",
  initiated: "bg-gray-50 text-gray-700",
  ringing: "bg-blue-50 text-blue-700",
  busy: "bg-orange-50 text-orange-700",
};

const leadBadgeColors: Record<string, string> = {
  hot: "bg-red-50 text-red-700 border-red-200",
  warm: "bg-amber-50 text-amber-700 border-amber-200",
  cold: "bg-blue-50 text-blue-700 border-blue-200",
};

export function CallingAgentsTab({ data }: { data: CallingAgentsData }) {
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingAI, setLoadingAI] = useState(true);

  // Auto-analyze on mount: trigger analysis, then load results
  useEffect(() => {
    if (data.completedCalls === 0) {
      setLoadingAI(false);
      return;
    }

    const runAnalysis = async () => {
      try {
        // First trigger analysis for any unanalyzed calls
        await fetch("/api/calls/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        // Then load results
        const res = await fetch("/api/calls/analyze");
        const d = await res.json();
        if (d.analyzed_calls > 0) setAiAnalytics(d);
      } catch (err) {
        console.error("AI analysis failed:", err);
      }
      setLoadingAI(false);
    };

    setAnalyzing(true);
    runAnalysis().finally(() => setAnalyzing(false));
  }, [data.completedCalls]);

  // Use AI sentiment if available, otherwise fallback
  const sentimentData = aiAnalytics
    ? aiAnalytics.sentiment_distribution.map((s) => ({
        name: s.sentiment.charAt(0).toUpperCase() + s.sentiment.slice(1),
        value: s.count,
        fill: SENTIMENT_COLORS[s.sentiment] || "#94a3b8",
      }))
    : data.sentimentDistribution.map((s) => ({
        name: s.sentiment.charAt(0).toUpperCase() + s.sentiment.slice(1),
        value: s.count,
        fill: SENTIMENT_COLORS[s.sentiment] || "#94a3b8",
      }));

  const leadData = aiAnalytics
    ? aiAnalytics.lead_distribution.map((l) => ({
        name: l.temperature.charAt(0).toUpperCase() + l.temperature.slice(1),
        value: l.count,
        fill: LEAD_COLORS[l.temperature] || "#94a3b8",
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Gradient Stats Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="border-[#DE6C33]/20 bg-gradient-to-br from-[#DE6C33]/5 to-[#F2A339]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#DE6C33]/10 p-2">
                <Phone className="h-5 w-5 text-[#DE6C33]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{data.totalCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{data.completedCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#2E3192]/20 bg-gradient-to-br from-[#2E3192]/5 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#2E3192]/10 p-2">
                <TrendingUp className="h-5 w-5 text-[#2E3192]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{data.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#00A2C7]/20 bg-gradient-to-br from-[#00A2C7]/5 to-cyan-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#00A2C7]/10 p-2">
                <Clock className="h-5 w-5 text-[#00A2C7]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(data.avgDuration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-violet-500/5 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Timer className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Talk Time</p>
                <p className="text-2xl font-bold">{formatDuration(data.totalTalkTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Loading Indicator */}
      {analyzing && (
        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-fuchsia-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <div>
                <p className="text-sm font-medium">Analyzing calls with AI...</p>
                <p className="text-xs text-muted-foreground">Processing transcripts for sentiment, lead scoring, and insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Lead Temperature + Sentiment Row */}
      {aiAnalytics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Lead Temperature Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ThermometerSun className="h-4 w-4 text-orange-500" />
                Lead Temperature
              </CardTitle>
              <CardDescription>Hot, warm, and cold leads from AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {leadData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={leadData}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={85}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {leadData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={ThermometerSun} message="No lead data yet" />
              )}
            </CardContent>
          </Card>

          {/* Hot Leads */}
          <Card className="border-red-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-4 w-4 text-red-500" />
                Hot Leads
              </CardTitle>
              <CardDescription>High-interest prospects ready to convert</CardDescription>
            </CardHeader>
            <CardContent>
              {aiAnalytics.hot_leads.length > 0 ? (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {aiAnalytics.hot_leads.map((lead) => (
                    <div key={lead.id} className="rounded-lg border border-red-100 bg-red-50/30 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {lead.contact_name || lead.to_number || lead.from_number || "Unknown"}
                        </span>
                        <Badge className={leadBadgeColors.hot + " text-xs"}>
                          Score: {lead.lead_score}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lead.summary}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {lead.agent_name && <span>via {lead.agent_name}</span>}
                        <span>{new Date(lead.started_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Flame} message="No hot leads yet" />
              )}
            </CardContent>
          </Card>

          {/* Cold Leads */}
          <Card className="border-blue-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Snowflake className="h-4 w-4 text-blue-500" />
                Cold Leads
              </CardTitle>
              <CardDescription>Low-interest contacts for follow-up strategy</CardDescription>
            </CardHeader>
            <CardContent>
              {aiAnalytics.cold_leads.length > 0 ? (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {aiAnalytics.cold_leads.map((lead) => (
                    <div key={lead.id} className="rounded-lg border border-blue-100 bg-blue-50/30 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {lead.contact_name || lead.to_number || lead.from_number || "Unknown"}
                        </span>
                        <Badge className={leadBadgeColors.cold + " text-xs"}>
                          Score: {lead.lead_score}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lead.summary}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {lead.agent_name && <span>via {lead.agent_name}</span>}
                        <span>{new Date(lead.started_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Snowflake} message="No cold leads yet" />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Topics & Engagement */}
      {aiAnalytics && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Discussion Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Discussion Topics</CardTitle>
              <CardDescription>Most frequently discussed subjects across calls</CardDescription>
            </CardHeader>
            <CardContent>
              {aiAnalytics.top_topics.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={aiAnalytics.top_topics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="topic" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill={VONEX_COLORS.primary} radius={[0, 4, 4, 0]} name="Mentions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={BarChart3} message="No topic data yet" />
              )}
            </CardContent>
          </Card>

          {/* Engagement Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Engagement Level</CardTitle>
              <CardDescription>Customer engagement across calls</CardDescription>
            </CardHeader>
            <CardContent>
              {aiAnalytics.engagement_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={aiAnalytics.engagement_distribution.map((e) => ({
                        name: e.level.charAt(0).toUpperCase() + e.level.slice(1),
                        value: e.count,
                        fill: ENGAGEMENT_COLORS[e.level] || "#94a3b8",
                      }))}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {aiAnalytics.engagement_distribution.map((e, i) => (
                        <Cell key={i} fill={ENGAGEMENT_COLORS[e.level] || CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={Activity} message="No engagement data yet" />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Row 2: Call Volume + Call Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call Volume</CardTitle>
            <CardDescription>Inbound vs Outbound (30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {data.callsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.callsByDay}>
                  <defs>
                    <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VONEX_COLORS.cyan} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={VONEX_COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VONEX_COLORS.orange} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={VONEX_COLORS.orange} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="inbound" stackId="1" stroke={VONEX_COLORS.cyan} fill="url(#inboundGrad)" strokeWidth={2} name="Inbound" />
                  <Area type="monotone" dataKey="outbound" stackId="1" stroke={VONEX_COLORS.orange} fill="url(#outboundGrad)" strokeWidth={2} name="Outbound" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} message="No call volume data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call Status</CardTitle>
            <CardDescription>Distribution by outcome</CardDescription>
          </CardHeader>
          <CardContent>
            {data.callStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.callStatusDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="count"
                    nameKey="status"
                    label={false}
                    labelLine={false}
                  >
                    {data.callStatusDistribution.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Activity} message="No call status data yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Duration Distribution + Sentiment + Peak Hours */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Duration Distribution</CardTitle>
            <CardDescription>Call length buckets</CardDescription>
          </CardHeader>
          <CardContent>
            {data.durationDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.durationDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={VONEX_COLORS.orange} radius={[4, 4, 0, 0]} name="Calls" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Clock} message="No duration data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Sentiment Analysis
              {aiAnalytics && (
                <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                  AI-powered
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {aiAnalytics
                ? `AI sentiment score: ${aiAnalytics.avg_sentiment > 0 ? "+" : ""}${aiAnalytics.avg_sentiment}`
                : "Call outcome sentiment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  data={sentimentData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={6} label={{ fill: "#666", fontSize: 11, position: "insideStart" }} />
                  <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Users} message="No sentiment data yet" />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Peak Hours</CardTitle>
            <CardDescription>Calls by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            {data.peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h) => `${h}:00`} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip labelFormatter={(h) => `${h}:00 - ${h}:59`} />
                  <Bar dataKey="count" name="Calls" radius={[3, 3, 0, 0]}>
                    {data.peakHours.map((entry, i) => {
                      const maxCount = Math.max(...data.peakHours.map((h) => h.count), 1);
                      const intensity = entry.count / maxCount;
                      const r = Math.round(222 + (46 - 222) * intensity);
                      const g = Math.round(108 + (49 - 108) * intensity);
                      const b = Math.round(51 + (146 - 51) * intensity);
                      return <Cell key={i} fill={`rgb(${r},${g},${b})`} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} message="No peak hour data yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Agent Leaderboard + Campaign Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Leaderboard</CardTitle>
            <CardDescription>Top performing calling agents</CardDescription>
          </CardHeader>
          <CardContent>
            {data.agentLeaderboard.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.agentLeaderboard} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calls" fill={VONEX_COLORS.orange} radius={[0, 4, 4, 0]} name="Calls" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Users} message="No agent data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Progress</CardTitle>
            <CardDescription>Active campaign performance</CardDescription>
          </CardHeader>
          <CardContent>
            {data.campaigns.length > 0 ? (
              <div className="space-y-4">
                {data.campaigns.map((c) => {
                  const progress = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
                  const success = c.completed > 0 ? Math.round((c.successful / c.completed) * 100) : 0;
                  return (
                    <div key={c.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{c.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {c.status}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{c.completed}/{c.total} ({progress}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-[#DE6C33] transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Success rate</span>
                          <span className="text-emerald-600 font-medium">{success}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Activity} message="No campaigns yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls Table */}
      {data.recentCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Calls</CardTitle>
            <CardDescription>Latest phone call activity</CardDescription>
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
                          <span className={`inline-flex items-center text-xs font-medium capitalize ${call.direction === "inbound" ? "text-blue-600" : "text-orange-600"}`}>
                            {call.direction}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-sm">{call.agent_name || "\u2014"}</td>
                        <td className="py-3 pr-4 text-sm font-mono text-muted-foreground">{phoneNum || "\u2014"}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${callStatusBadge[call.status] || ""}`}>
                            {call.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {call.duration_seconds > 0 ? formatDuration(call.duration_seconds) : "\u2014"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {new Date(call.started_at).toLocaleDateString()}
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
