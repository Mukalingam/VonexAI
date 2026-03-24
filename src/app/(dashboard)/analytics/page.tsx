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
  BarChart3,
  MessageSquare,
  Bot,
  Clock,
  TrendingUp,
  Users,
  Zap,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  recentConversations: {
    id: string;
    agent_name: string;
    total_turns: number;
    status: string;
    started_at: string;
  }[];
  topAgents: {
    id: string;
    name: string;
    conversations: number;
    avg_rating: number;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics/overview");
        if (res.ok) {
          const analytics = await res.json();
          setData(analytics);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const stats = [
    {
      label: "Total Agents",
      value: data?.totalAgents ?? 0,
      icon: Bot,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Active Agents",
      value: data?.activeAgents ?? 0,
      icon: Zap,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Total Conversations",
      value: data?.totalConversations ?? 0,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Messages",
      value: data?.totalMessages ?? 0,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Avg Response Time",
      value: data?.avgResponseTime ? `${data.avgResponseTime}ms` : "N/A",
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      label: "Satisfaction Rate",
      value: data?.avgSatisfaction
        ? `${(data.avgSatisfaction * 100).toFixed(0)}%`
        : "N/A",
      icon: ThumbsUp,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Monitor your voice agents&apos; performance and usage metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Usage</CardTitle>
          <CardDescription>
            Monthly API call consumption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>
                {data?.apiCallsUsed ?? 0} / {data?.apiCallsLimit ?? 100} calls
                used
              </span>
              <span className="text-muted-foreground">
                {data?.apiCallsLimit
                  ? (
                      ((data?.apiCallsUsed ?? 0) / data.apiCallsLimit) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${
                    data?.apiCallsLimit
                      ? ((data?.apiCallsUsed ?? 0) / data.apiCallsLimit) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Agents</CardTitle>
            <CardDescription>By conversation volume</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.topAgents && data.topAgents.length > 0 ? (
              <div className="space-y-4">
                {data.topAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                          index === 0
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {agent.conversations} conversations
                        </p>
                      </div>
                    </div>
                    {agent.avg_rating > 0 && (
                      <Badge variant="success">
                        {agent.avg_rating.toFixed(1)} rating
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No agent data yet. Create and test agents to see metrics.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
            <CardDescription>Latest testing sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentConversations &&
            data.recentConversations.length > 0 ? (
              <div className="space-y-4">
                {data.recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{conv.agent_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.total_turns} turns &middot;{" "}
                        {new Date(conv.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        conv.status === "completed" ? "success" : "secondary"
                      }
                    >
                      {conv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No conversations yet. Test your agents to see activity.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
