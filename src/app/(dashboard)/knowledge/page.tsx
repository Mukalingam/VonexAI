"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  ArrowRight,
  Loader2,
  Bot,
} from "lucide-react";

interface AgentKBSummary {
  id: string;
  name: string;
  status: string;
  kb_count: number;
  file_count: number;
  url_count: number;
  faq_count: number;
}

export default function KnowledgeOverviewPage() {
  const [agents, setAgents] = useState<AgentKBSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all agents
        const agentsRes = await fetch("/api/agents");
        if (!agentsRes.ok) return;
        const agentsData = await agentsRes.json();

        // For each agent, fetch KB item counts
        const summaries: AgentKBSummary[] = await Promise.all(
          (agentsData.agents || []).map(async (agent: { id: string; name: string; status: string }) => {
            try {
              const kbRes = await fetch(`/api/agents/${agent.id}/knowledge`);
              if (!kbRes.ok) return { id: agent.id, name: agent.name, status: agent.status, kb_count: 0, file_count: 0, url_count: 0, faq_count: 0 };
              const kbData = await kbRes.json();
              const items = kbData.items || [];
              return {
                id: agent.id,
                name: agent.name,
                status: agent.status,
                kb_count: items.length,
                file_count: items.filter((i: { source_type: string }) => i.source_type === "file").length,
                url_count: items.filter((i: { source_type: string }) => i.source_type === "url").length,
                faq_count: items.filter((i: { source_type: string }) => i.source_type === "faq" || i.source_type === "text").length,
              };
            } catch {
              return { id: agent.id, name: agent.name, status: agent.status, kb_count: 0, file_count: 0, url_count: 0, faq_count: 0 };
            }
          })
        );

        setAgents(summaries);
      } catch (error) {
        console.error("Failed to fetch knowledge overview:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalItems = agents.reduce((sum, a) => sum + a.kb_count, 0);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        </div>
        <p className="text-muted-foreground">
          Manage knowledge bases across all your agents. Each agent uses its KB to provide informed responses.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{agents.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{totalItems}</p>
            <p className="text-xs text-muted-foreground mt-1">KB Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{agents.reduce((s, a) => s + a.file_count, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Files</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{agents.reduce((s, a) => s + a.url_count + a.faq_count, 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">URLs & FAQs</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent List */}
      {agents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No agents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an agent to start building a knowledge base.
            </p>
            <Button asChild>
              <Link href="/agents/new">Create Agent</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{agent.name}</h3>
                        <Badge variant={agent.status === "active" ? "success" : "secondary"} className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {agent.file_count} files
                        </span>
                        <span className="flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          {agent.url_count} URLs
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          {agent.faq_count} FAQs
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/agents/${agent.id}/knowledge`}>
                      Manage
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
