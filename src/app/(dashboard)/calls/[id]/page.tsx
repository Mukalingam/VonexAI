"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TranscriptViewer } from "@/components/calls/transcript-viewer";
import { AudioPlayer } from "@/components/calls/audio-player";
import { cn } from "@/lib/utils";
import type { CallLog } from "@/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  initiated: { label: "Initiated", color: "bg-blue-100 text-blue-700" },
  ringing: { label: "Ringing", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
  no_answer: { label: "No Answer", color: "bg-orange-100 text-orange-700" },
  busy: { label: "Busy", color: "bg-orange-100 text-orange-700" },
};

function formatDuration(seconds: number): string {
  if (!seconds) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [call, setCall] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappMessages, setWhatsappMessages] = useState<Array<{
    id: string;
    to_number: string;
    content: string;
    status: string;
    created_at: string;
  }>>([]);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/calls/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setCall(data);
        // Fetch WhatsApp messages for this call
        fetch(`/api/whatsapp?call_log_id=${id}`)
          .then((r) => r.json())
          .then((d) => setWhatsappMessages(d.messages || []))
          .catch(() => {});
      })
      .catch(() => {
        toast.error("Call not found");
        router.push("/calls");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleManualWhatsApp = async () => {
    if (!call) return;
    setSendingWhatsApp(true);
    try {
      const res = await fetch("/api/whatsapp/auto-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_log_id: call.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("WhatsApp message sent!");
        // Refresh messages
        const msgRes = await fetch(`/api/whatsapp?call_log_id=${call.id}`);
        const msgData = await msgRes.json();
        setWhatsappMessages(msgData.messages || []);
      } else {
        toast.info(data.message || "No WhatsApp needed for this call");
      }
    } catch {
      toast.error("Failed to send WhatsApp");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  if (loading || !call) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = statusConfig[call.status] || statusConfig.initiated;
  const metadata = call.metadata as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/calls")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Call Detail</h1>
            <Badge variant="secondary" className={cn("gap-1", status.color)}>
              {call.direction === "inbound" ? (
                <PhoneIncoming className="h-3 w-3" />
              ) : (
                <PhoneOutgoing className="h-3 w-3" />
              )}
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(call.started_at), "PPpp")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Call Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Call Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Direction</p>
                <p className="font-medium capitalize">{call.direction}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="flex items-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(call.duration_seconds)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-medium">{call.from_number || "--"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">To</p>
                <p className="font-medium">{call.to_number || "--"}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-[#2E3192]" />
                <p className="text-sm font-medium">
                  {call.agent?.name || "Unknown Agent"}
                </p>
              </div>
              {call.phone_number && (
                <p className="text-xs text-muted-foreground">
                  Via: {call.phone_number.friendly_name || call.phone_number.phone_number}
                </p>
              )}
            </div>

            {metadata?.call_successful !== undefined && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {metadata.call_successful ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <p className="text-sm font-medium">
                      {metadata.call_successful
                        ? "Call Successful"
                        : "Call Unsuccessful"}
                    </p>
                  </div>
                  {metadata.call_summary ? (
                    <p className="text-xs text-muted-foreground">
                      {String(metadata.call_summary)}
                    </p>
                  ) : null}
                </div>
              </>
            )}

            {call.sentiment_score !== null && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Sentiment Score</p>
                  <p className="text-lg font-bold">
                    {(call.sentiment_score * 100).toFixed(0)}%
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Transcript & Recording */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recording */}
          {call.elevenlabs_conversation_id && call.status === "completed" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <AudioPlayer src={`/api/calls/${call.id}/recording`} />
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <TranscriptViewer transcript={call.transcript || []} />
            </CardContent>
          </Card>

          {/* WhatsApp Follow-up */}
          {call.status === "completed" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    WhatsApp Follow-up
                  </CardTitle>
                  {whatsappMessages.length === 0 && call.transcript && call.transcript.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                      onClick={handleManualWhatsApp}
                      disabled={sendingWhatsApp}
                    >
                      {sendingWhatsApp ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {sendingWhatsApp ? "Analyzing..." : "Send WhatsApp"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {whatsappMessages.length > 0 ? (
                  <div className="space-y-3">
                    {whatsappMessages.map((msg) => (
                      <div key={msg.id} className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                              Sent to {msg.to_number}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              msg.status === "sent" || msg.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : msg.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            )}
                          >
                            {msg.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No WhatsApp messages sent for this call yet. Click &quot;Send WhatsApp&quot; to analyze the transcript and send a follow-up if appropriate.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
