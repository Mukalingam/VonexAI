"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Loader2 } from "lucide-react";
import { VonexLogo } from "@/components/ui/vonex-logo";
import type { Agent } from "@/types";

export default function PublicChatPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`/api/public/agents/${agentId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Agent not found or not available");
          return;
        }
        const data = await res.json();
        setAgent(data);
      } catch {
        setError("Failed to load agent");
      } finally {
        setLoading(false);
      }
    }
    fetchAgent();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <VonexLogo height={40} />
        <div className="text-center">
          <h1 className="text-xl font-bold">Agent Unavailable</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {error || "This agent is not available for public access."}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold">Vonex AI</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Minimal header */}
      <header className="border-b bg-background/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <VonexLogo height={28} />
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-sm font-semibold">{agent.name}</h1>
            {agent.description && (
              <p className="text-xs text-muted-foreground truncate max-w-md">
                {agent.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Chat widget in full-page mode */}
      <div className="flex-1">
        <ChatWidget agent={agent} fullPage apiBasePath={`/api/public/agents/${agentId}`} />
      </div>

      {/* Footer */}
      <footer className="border-t px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold">Vonex AI</span>
        </p>
      </footer>
    </div>
  );
}
