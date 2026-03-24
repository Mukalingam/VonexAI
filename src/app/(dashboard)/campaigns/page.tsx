"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  Users,
  CheckCircle2,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Campaign, CampaignStatus } from "@/types";

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  paused: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/campaigns?${params}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      console.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    contactsReached: campaigns.reduce((sum, c) => sum + c.completed_calls, 0),
    successRate:
      campaigns.reduce((sum, c) => sum + c.completed_calls, 0) > 0
        ? Math.round(
            (campaigns.reduce((sum, c) => sum + c.successful_calls, 0) /
              campaigns.reduce((sum, c) => sum + c.completed_calls, 0)) *
              100
          )
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Organize and launch outbound calling campaigns
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
            <Play className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contacts Reached
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.contactsReached}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.successRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Campaigns table */}
      {campaigns.length === 0 && !loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Megaphone className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">No campaigns yet</h3>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              Create your first campaign to start making organized outbound calls
              with your deployed agents.
            </p>
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Success</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const progress =
                    campaign.total_contacts > 0
                      ? Math.round(
                          (campaign.completed_calls / campaign.total_contacts) * 100
                        )
                      : 0;
                  const successRate =
                    campaign.completed_calls > 0
                      ? Math.round(
                          (campaign.successful_calls / campaign.completed_calls) * 100
                        )
                      : 0;

                  return (
                    <tr
                      key={campaign.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {campaign.agent?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={statusColors[campaign.status]}
                        >
                          {campaign.status === "active" && (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          )}
                          {campaign.status === "paused" && (
                            <Pause className="mr-1 h-3 w-3" />
                          )}
                          {campaign.status === "completed" && (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          )}
                          {campaign.status.charAt(0).toUpperCase() +
                            campaign.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-24" />
                          <span className="text-xs text-muted-foreground">
                            {campaign.completed_calls}/{campaign.total_contacts}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {campaign.completed_calls > 0 ? `${successRate}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
