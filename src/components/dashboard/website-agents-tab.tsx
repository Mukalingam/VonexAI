"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MonitorSmartphone,
  Activity,
  MessageSquare,
  Clock,
  Globe,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_PALETTE, VONEX_COLORS } from "./charts/chart-colors";

export interface WebsiteAgentsData {
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  avgResponseTime: number;
  conversationsByDay: { date: string; count: number }[];
  agentPerformance: { name: string; conversations: number; avgRating: number }[];
  domainDistribution: { domain: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  recentConversations: {
    id: string;
    agent_name: string;
    total_turns: number;
    status: string;
    started_at: string;
  }[];
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

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function WebsiteAgentsTab({ data }: { data: WebsiteAgentsData }) {
  return (
    <div className="space-y-6">
      {/* Gradient Stats Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-[#2E3192]/20 bg-gradient-to-br from-[#2E3192]/5 to-[#00A2C7]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#2E3192]/10 p-2">
                <MonitorSmartphone className="h-5 w-5 text-[#2E3192]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{data.totalAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{data.activeAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#00A2C7]/20 bg-gradient-to-br from-[#00A2C7]/5 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#00A2C7]/10 p-2">
                <MessageSquare className="h-5 w-5 text-[#00A2C7]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">{data.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#F2A339]/20 bg-gradient-to-br from-[#F2A339]/5 to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#F2A339]/10 p-2">
                <Clock className="h-5 w-5 text-[#F2A339]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{formatMs(data.avgResponseTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Conversation Volume + Agent Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversation Volume</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {data.conversationsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.conversationsByDay}>
                  <defs>
                    <linearGradient id="convGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VONEX_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={VONEX_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={VONEX_COLORS.primary}
                    fill="url(#convGradient)"
                    strokeWidth={2}
                    name="Conversations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} message="No conversation data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Performance</CardTitle>
            <CardDescription>Conversations per agent</CardDescription>
          </CardHeader>
          <CardContent>
            {data.agentPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.agentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="conversations" fill={VONEX_COLORS.primary} radius={[0, 4, 4, 0]} name="Conversations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Users} message="No agent performance data yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Domain Distribution + Conversation Status */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domain Distribution</CardTitle>
            <CardDescription>Agents by industry</CardDescription>
          </CardHeader>
          <CardContent>
            {data.domainDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.domainDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="count"
                    nameKey="domain"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.domainDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Globe} message="No domain data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversation Status</CardTitle>
            <CardDescription>Active vs completed</CardDescription>
          </CardHeader>
          <CardContent>
            {data.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.statusDistribution.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.status === "active" ? VONEX_COLORS.cyan
                          : entry.status === "completed" ? "#22c55e"
                          : CHART_PALETTE[i % CHART_PALETTE.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={MessageSquare} message="No conversation status data" />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Response Time Trend</CardTitle>
            <CardDescription>Average latency over time</CardDescription>
          </CardHeader>
          <CardContent>
            {data.conversationsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.conversationsByDay}>
                  <defs>
                    <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VONEX_COLORS.cyan} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={VONEX_COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(8)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={VONEX_COLORS.cyan}
                    fill="url(#latencyGrad)"
                    strokeWidth={2}
                    name="Conversations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Clock} message="No response time data" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations Table */}
      {data.recentConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Conversations</CardTitle>
            <CardDescription>Latest website chat sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Agent</th>
                    <th className="pb-3 pr-4 font-medium">Turns</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentConversations.map((conv) => (
                    <tr key={conv.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-sm font-medium">{conv.agent_name}</td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">{conv.total_turns || 0}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          conv.status === "active" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {conv.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {new Date(conv.started_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
