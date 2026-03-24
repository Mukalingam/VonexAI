"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Loader2,
  Clock,
  Bot,
  Megaphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Campaign, CampaignCall, CampaignStatus, CampaignCallStatus } from "@/types";

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  paused: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
};

const callStatusColors: Record<CampaignCallStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  calling: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  no_answer: "bg-warning/10 text-warning",
  voicemail: "bg-muted text-muted-foreground",
  skipped: "bg-muted text-muted-foreground",
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [calls, setCalls] = useState<CampaignCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [campaignRes, callsRes] = await Promise.all([
        fetch(`/api/campaigns/${id}`),
        fetch(`/api/campaigns/${id}/calls?limit=100`),
      ]);
      const campaignData = await campaignRes.json();
      const callsData = await callsRes.json();
      setCampaign(campaignData.campaign || null);
      setCalls(callsData.calls || []);
    } catch {
      console.error("Failed to fetch campaign data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh while active
  useEffect(() => {
    if (campaign?.status !== "active") return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [campaign?.status, fetchData]);

  const handleLaunch = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/launch`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to launch");
      }
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to launch campaign");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/campaigns/${id}/pause`, { method: "POST" });
      await fetchData();
    } catch {
      toast.error("Failed to pause campaign");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      router.push("/campaigns");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete campaign");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Campaign not found</p>
        <Button variant="outline" asChild>
          <Link href="/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    );
  }

  const progress =
    campaign.total_contacts > 0
      ? Math.round((campaign.completed_calls / campaign.total_contacts) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/campaigns")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {campaign.name}
            </h1>
            <Badge
              variant="secondary"
              className={statusColors[campaign.status]}
            >
              {campaign.status === "active" && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              {campaign.status.charAt(0).toUpperCase() +
                campaign.status.slice(1)}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" />
              {campaign.agent?.name || "Unknown Agent"}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {campaign.phone_number?.phone_number || "No phone"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {(campaign.status === "draft" || campaign.status === "paused") && (
            <Button onClick={handleLaunch} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {campaign.status === "paused" ? "Resume" : "Launch"}
            </Button>
          )}
          {campaign.status === "active" && (
            <Button
              variant="outline"
              onClick={handlePause}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Pause className="mr-2 h-4 w-4" />
              )}
              Pause
            </Button>
          )}
          {campaign.status !== "active" && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={actionLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.total_contacts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.completed_calls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              {campaign.successful_calls}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {campaign.failed_calls}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Campaign Progress</span>
            <span className="text-muted-foreground">
              {campaign.completed_calls} / {campaign.total_contacts} ({progress}
              %)
            </span>
          </div>
          <Progress value={progress} className="mt-2 h-3" />
        </CardContent>
      </Card>

      {/* Contacts table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Attempts</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Last Attempt</th>
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No contacts loaded yet
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr
                    key={call.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-mono text-sm">
                      {call.contact_phone}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {call.contact_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={callStatusColors[call.status]}
                      >
                        {call.status === "calling" && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        {call.status === "completed" && (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {call.status === "failed" && (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {call.status === "pending" && (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {call.status.replace("_", " ").charAt(0).toUpperCase() +
                          call.status.replace("_", " ").slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{call.attempts}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {call.outcome || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {call.last_attempt_at
                        ? new Date(call.last_attempt_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
