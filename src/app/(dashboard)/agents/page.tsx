"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Copy,
  Trash2,
  Filter,
  Clock,
  Mic,
  Share2,
  MonitorSmartphone,
  Phone,
  Rocket,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import type { Agent, AgentDomain, AgentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 12;

const domainLabels: Record<AgentDomain, string> = {
  healthcare: "Healthcare",
  sales: "Sales",
  customer_support: "Customer Support",
  education: "Education",
  real_estate: "Real Estate",
  hospitality: "Hospitality",
  ecommerce: "E-Commerce",
  automobile: "Automobile",
  manufacturing: "Manufacturing",
  banking: "Banking & Finance",
  legal: "Legal",
  logistics: "Logistics",
  insurance: "Insurance",
  home_services: "Home Services",
  solar_energy: "Solar & Energy",
  travel_tourism: "Travel & Tourism",
  custom: "Custom",
};

const statusConfig: Record<
  AgentStatus,
  { label: string; variant: "success" | "warning" | "secondary" | "destructive" }
> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  draft: { label: "Draft", variant: "secondary" },
  archived: { label: "Archived", variant: "destructive" },
};

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (domainFilter !== "all") params.set("domain", domainFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (channelFilter !== "all") params.set("channel", channelFilter);
      params.set("page", page.toString());
      params.set("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(`/api/agents?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch agents");

      const data = await res.json();
      setAgents(data.agents);
      setTotalCount(data.total);
    } catch {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, domainFilter, statusFilter, channelFilter, page]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, domainFilter, statusFilter, channelFilter]);

  const handleDeploy = async (agent: Agent) => {
    try {
      toast.info(`Deploying "${agent.name}" to ElevenLabs...`);
      const res = await fetch(`/api/agents/${agent.id}/deploy`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to deploy agent");
      }
      toast.success(`Agent "${agent.name}" deployed successfully`);
      fetchAgents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deploy agent");
    }
  };

  const handleDuplicate = async (agent: Agent) => {
    try {
      const res = await fetch(`/api/agents/${agent.id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to duplicate agent");
      toast.success(`Agent "${agent.name}" duplicated successfully`);
      fetchAgents();
    } catch {
      toast.error("Failed to duplicate agent");
    }
  };

  const handleDelete = async () => {
    if (!agentToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agentToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete agent");
      toast.success(`Agent "${agentToDelete.name}" deleted`);
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
      fetchAgents();
    } catch {
      toast.error("Failed to delete agent");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Agents</h1>
          <p className="text-muted-foreground">
            Manage and monitor your AI voice agents
          </p>
        </div>
        <Button asChild>
          <Link href="/agents/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Agent
          </Link>
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {Object.entries(domainLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="calling">Calling</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        /* Empty State */
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">No agents yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Get started by creating your first AI voice agent. Choose a domain,
            configure the personality, and deploy in minutes.
          </p>
          <Button asChild className="mt-6">
            <Link href="/agents/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Agent
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Agent Cards Grid */}
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {agents.map((agent) => {
              const status = statusConfig[agent.status];
              return (
                <Card
                  key={agent.id}
                  className={cn(
                    "group relative transition-shadow hover:shadow-md",
                    viewMode === "list" && "flex flex-row items-center"
                  )}
                >
                  <CardHeader
                    className={cn(
                      viewMode === "list" && "flex-1 py-4"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base truncate">
                            {agent.name}
                          </CardTitle>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-normal",
                              agent.agent_channel === "calling"
                                ? "border-orange-300 bg-orange-50 text-orange-700"
                                : "border-blue-300 bg-blue-50 text-blue-700"
                            )}
                          >
                            {agent.agent_channel === "calling" ? (
                              <Phone className="mr-1 h-3 w-3" />
                            ) : (
                              <MonitorSmartphone className="mr-1 h-3 w-3" />
                            )}
                            {agent.agent_channel === "calling" ? "Calling" : "Website"}
                          </Badge>
                          <Badge variant="outline" className="font-normal">
                            {domainLabels[agent.domain]}
                          </Badge>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/agents/${agent.id}`)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/agents/${agent.id}/test`)
                            }
                          >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Test
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/agents/${agent.id}/integrations`)
                            }
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Integrations
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeploy(agent)}
                          >
                            <Rocket className="mr-2 h-4 w-4" />
                            {agent.elevenlabs_agent_id ? "Redeploy" : "Deploy"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(agent)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setAgentToDelete(agent);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent
                    className={cn(
                      viewMode === "list" &&
                        "flex items-center gap-6 py-4 pl-0"
                    )}
                  >
                    {agent.description && (
                      <p className="text-sm text-muted-foreground">
                        {truncate(agent.description, 120)}
                      </p>
                    )}
                    <div
                      className={cn(
                        "flex items-center gap-4 text-xs text-muted-foreground",
                        agent.description ? "mt-3" : ""
                      )}
                    >
                      {agent.voice_id && (
                        <span className="flex items-center gap-1">
                          <Mic className="h-3 w-3" />
                          {agent.voice_gender || "Voice"} configured
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(agent.updated_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
                agents
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className="hidden sm:inline-flex"
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {agentToDelete?.name}
              </span>
              ? This action cannot be undone. All associated conversations and
              data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
