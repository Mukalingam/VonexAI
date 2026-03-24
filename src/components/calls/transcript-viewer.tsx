"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface TranscriptEntry {
  role: string;
  text?: string;
  message?: string; // ElevenLabs uses "message" instead of "text"
  timestamp?: number;
  time_in_call_secs?: number; // ElevenLabs uses this instead of "timestamp"
}

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
}

function formatTimestamp(seconds?: number): string {
  if (seconds === undefined || seconds === null) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <p className="text-sm">No transcript available</p>
        <p className="text-xs">Transcript will appear after the call ends</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transcript.map((entry, index) => {
        const isAgent = entry.role === "agent" || entry.role === "assistant";
        // Handle both our normalised format ("text") and raw ElevenLabs format ("message")
        const text = entry.text || entry.message || "";
        const ts = entry.timestamp ?? entry.time_in_call_secs;

        if (!text) return null; // skip empty entries

        return (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              isAgent ? "flex-row" : "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                isAgent
                  ? "bg-[#2E3192]/10 text-[#2E3192]"
                  : "bg-blue-100 text-blue-600"
              )}
            >
              {isAgent ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5",
                isAgent
                  ? "rounded-tl-sm bg-muted"
                  : "rounded-tr-sm bg-[#2E3192] text-white"
              )}
            >
              <p className="text-sm leading-relaxed">{text}</p>
              {ts !== undefined && (
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    isAgent ? "text-muted-foreground" : "text-white/70"
                  )}
                >
                  {formatTimestamp(ts)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
