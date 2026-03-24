"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Link as LinkIcon,
  Code,
  Webhook,
  Globe,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { Agent } from "@/types";

const WEBHOOK_EVENT_TYPES = [
  { id: "conversation.started", label: "Conversation Started" },
  { id: "conversation.ended", label: "Conversation Ended" },
  { id: "message.received", label: "Message Received" },
  { id: "message.sent", label: "Message Sent" },
] as const;

export default function IntegrationsPage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  // Share Link state
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Embed Widget state
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // REST API state
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<
    "success" | "error" | null
  >(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data: Agent = await res.json();
          setAgent(data);
          setWebhookUrl(data.webhook_url || "");
          setWebhookEvents(
            data.advanced_settings?.webhook_events || []
          );
        }
      } catch (error) {
        console.error("Failed to fetch agent:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAgent();
  }, [agentId]);

  // --- Helpers ---

  const copyToClipboard = async (
    text: string,
    setter: (v: boolean) => void
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  const handleTogglePublic = async () => {
    if (!agent) return;
    setTogglingPublic(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !agent.is_public }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAgent(updated);
      }
    } catch (error) {
      console.error("Failed to toggle public access:", error);
    } finally {
      setTogglingPublic(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!agent) return;
    setSavingWebhook(true);
    setWebhookSaved(false);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhook_url: webhookUrl || null,
          advanced_settings: {
            ...agent.advanced_settings,
            webhook_events: webhookEvents,
          },
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAgent(updated);
        setWebhookSaved(true);
        setTimeout(() => setWebhookSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save webhook settings:", error);
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) return;
    setTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await fetch(`/api/agents/${agentId}/webhook-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });
      const data = await res.json();
      setWebhookTestResult(data.success ? "success" : "error");
    } catch {
      setWebhookTestResult("error");
    } finally {
      setTestingWebhook(false);
      setTimeout(() => setWebhookTestResult(null), 4000);
    }
  };

  const toggleWebhookEvent = (eventId: string) => {
    setWebhookEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  // --- Computed values ---

  const publicUrl = `${origin}/chat/${agentId}`;
  const chatEndpoint = `${origin}/api/public/agents/${agentId}/chat`;

  const iframeSnippet = `<iframe src="${origin}/chat/${agentId}" width="400" height="600" style="border:none;border-radius:12px;" allow="microphone"></iframe>`;
  const scriptSnippet = `<script src="${origin}/embed.js" data-agent-id="${agentId}"></script>`;

  const curlExample = `curl -X POST ${chatEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello",
    "session_id": "optional-session-id"
  }'`;

  const requestBodyExample = `{
  "message": "Hello",
  "session_id": "optional-session-id"
}`;

  const responseExample = `{
  "text": "...",
  "audio_url": "...",
  "conversation_id": "..."
}`;

  // --- Render ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/agents/${agentId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Share, embed, and connect your agent
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="share-link" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="share-link" className="gap-1.5">
            <LinkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Share Link</span>
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-1.5">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Embed Widget</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">REST API</span>
          </TabsTrigger>
          <TabsTrigger value="webhook" className="gap-1.5">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhook</span>
          </TabsTrigger>
        </TabsList>

        {/* ===================== SHARE LINK ===================== */}
        <TabsContent value="share-link">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Public Share Link</CardTitle>
              <CardDescription>
                Enable public access to let anyone chat with your agent via a
                shareable link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Public Access</Label>
                  <p className="text-xs text-muted-foreground">
                    {agent.is_public
                      ? "Anyone with the link can chat with this agent"
                      : "Only you can access this agent"}
                  </p>
                </div>
                <Button
                  variant={agent.is_public ? "default" : "outline"}
                  size="sm"
                  onClick={handleTogglePublic}
                  disabled={togglingPublic}
                  className={
                    agent.is_public
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : ""
                  }
                >
                  {togglingPublic ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : agent.is_public ? (
                    "Enabled"
                  ) : (
                    "Disabled"
                  )}
                </Button>
              </div>

              {/* Public URL */}
              {agent.is_public && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Public URL
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
                      {publicUrl}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(publicUrl, setCopiedShareLink)
                      }
                    >
                      {copiedShareLink ? (
                        <>
                          <Check className="h-4 w-4 text-indigo-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== EMBED WIDGET ===================== */}
        <TabsContent value="embed">
          <div className="space-y-4">
            {/* iframe embed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">iframe Embed</CardTitle>
                <CardDescription>
                  Drop this snippet into any HTML page to embed the chat widget.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <pre className="rounded-md border bg-muted/50 p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {iframeSnippet}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(iframeSnippet, setCopiedIframe)
                  }
                >
                  {copiedIframe ? (
                    <>
                      <Check className="h-4 w-4 text-indigo-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* JS embed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">JavaScript Embed</CardTitle>
                <CardDescription>
                  Add this script tag to your page for a floating chat widget.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <pre className="rounded-md border bg-muted/50 p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {scriptSnippet}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(scriptSnippet, setCopiedScript)
                  }
                >
                  {copiedScript ? (
                    <>
                      <Check className="h-4 w-4 text-indigo-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================== REST API ===================== */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">REST API</CardTitle>
              <CardDescription>
                Send messages to your agent programmatically via the chat
                endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Endpoint */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Endpoint</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="success"
                    className="shrink-0 font-mono text-xs"
                  >
                    POST
                  </Badge>
                  <code className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
                    {chatEndpoint}
                  </code>
                </div>
              </div>

              {/* Request body */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Request Body</Label>
                <pre className="rounded-md border bg-muted/50 p-4 text-sm font-mono overflow-x-auto">
                  {requestBodyExample}
                </pre>
              </div>

              {/* curl example */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">cURL Example</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(curlExample, setCopiedCurl)
                    }
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="h-4 w-4 text-indigo-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="rounded-md border bg-muted/50 p-4 text-sm font-mono overflow-x-auto whitespace-pre">
                  {curlExample}
                </pre>
              </div>

              {/* Response example */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Response</Label>
                <pre className="rounded-md border bg-muted/50 p-4 text-sm font-mono overflow-x-auto">
                  {responseExample}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== WEBHOOK ===================== */}
        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook Configuration</CardTitle>
              <CardDescription>
                Receive real-time notifications when events occur in your
                agent&apos;s conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>

              {/* Event types */}
              <div className="space-y-3">
                <Label>Event Types</Label>
                <div className="space-y-2">
                  {WEBHOOK_EVENT_TYPES.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={webhookEvents.includes(event.id)}
                        onCheckedChange={() => toggleWebhookEvent(event.id)}
                      />
                      <Label
                        htmlFor={`event-${event.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {event.id}
                        </code>
                        <span className="ml-2 text-muted-foreground">
                          {event.label}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSaveWebhook}
                  disabled={savingWebhook}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {savingWebhook ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : webhookSaved ? (
                    <Check className="h-4 w-4" />
                  ) : null}
                  {savingWebhook
                    ? "Saving..."
                    : webhookSaved
                    ? "Saved!"
                    : "Save Webhook"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !webhookUrl}
                >
                  {testingWebhook ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {testingWebhook ? "Sending..." : "Test Webhook"}
                </Button>
                {webhookTestResult === "success" && (
                  <Badge variant="success">Test successful</Badge>
                )}
                {webhookTestResult === "error" && (
                  <Badge variant="destructive">Test failed</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
