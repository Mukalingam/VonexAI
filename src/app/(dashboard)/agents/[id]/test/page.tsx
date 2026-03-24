"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Settings,
  Share2,
  Download,
  MessageSquare,
  Plus,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import type { Agent, Message } from "@/types";

interface ConversationSummary {
  id: string;
  status: string;
  total_turns: number;
  started_at: string;
  ended_at: string | null;
  preview: string;
  message_count: number;
}

export default function AgentTestPage() {
  const params = useParams();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  const { setMessages, setConversationId, reset } = useChatStore();

  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          setAgent(data);
        }
      } catch (error) {
        console.error("Failed to fetch agent:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAgent();
  }, [agentId]);

  const fetchConversations = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [agentId]);

  // Fetch conversations when history panel opens
  useEffect(() => {
    if (historyOpen) {
      fetchConversations();
    }
  }, [historyOpen, fetchConversations]);

  async function loadConversation(convId: string) {
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (!res.ok) return;
      const data = await res.json();

      // Sort messages by created_at
      const msgs = (data.messages || []).sort(
        (a: Message, b: Message) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(msgs);
      setConversationId(convId);
      setActiveConvId(convId);
      setHistoryOpen(false);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }

  async function deleteConversation(convId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConvId === convId) {
          reset();
          setActiveConvId(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }

  function handleNewChat() {
    reset();
    setActiveConvId(null);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">Agent not found</p>
        <Button asChild variant="outline">
          <Link href="/agents">Back to Agents</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/agents/${agentId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{agent.name}</h1>
              <Badge
                variant={
                  agent.status === "active"
                    ? "success"
                    : agent.status === "paused"
                    ? "warning"
                    : "secondary"
                }
              >
                {agent.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {agent.domain} &middot; {agent.agent_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/agents/${agentId}/integrations`}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/agents/${agentId}`}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation History Sidebar */}
        <div
          className={cn(
            "border-r bg-muted/30 flex flex-col transition-all duration-300 overflow-hidden",
            historyOpen ? "w-72" : "w-0"
          )}
        >
          {historyOpen && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-sm font-semibold">Conversations</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleNewChat}
                  title="New conversation"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No conversations yet
                      </p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={cn(
                          "w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted group",
                          activeConvId === conv.id &&
                            "bg-primary/10 border border-primary/20"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium truncate flex-1">
                            {conv.preview}
                          </p>
                          <button
                            onClick={(e) => deleteConversation(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                            title="Delete conversation"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(conv.started_at)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            &middot; {conv.message_count} msgs
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* History toggle button */}
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-6 flex items-center justify-center border-r hover:bg-muted transition-colors shrink-0"
          title={historyOpen ? "Hide history" : "Show history"}
        >
          {historyOpen ? (
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Main Chat */}
        <div className="flex-1 min-w-0">
          <ChatWidget agent={agent} fullPage />
        </div>

        {/* Debug Panel */}
        <div className="hidden lg:block w-80 border-l overflow-y-auto">
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Debug Panel</h3>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Agent Config
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-mono">{agent.llm_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="font-mono">{agent.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Turns</span>
                  <span className="font-mono">{agent.max_turns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voice</span>
                  <span className="font-mono truncate max-w-[120px]">
                    {agent.voice_id || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-mono">{agent.language}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  System Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground max-h-48 overflow-y-auto">
                  {agent.system_prompt || "No system prompt configured"}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Session Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-2 text-xs" id="debug-metrics">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="font-mono" id="msg-count">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tokens</span>
                  <span className="font-mono" id="token-count">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Latency</span>
                  <span className="font-mono" id="avg-latency">-</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
