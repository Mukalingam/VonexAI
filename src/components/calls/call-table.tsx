"use client";

import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneMissed,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CallLog } from "@/types";

interface CallTableProps {
  calls: CallLog[];
  loading?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  initiated: { label: "Initiated", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  ringing: { label: "Ringing", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: XCircle },
  no_answer: { label: "No Answer", color: "bg-orange-100 text-orange-700", icon: PhoneMissed },
  busy: { label: "Busy", color: "bg-orange-100 text-orange-700", icon: PhoneMissed },
};

function formatDuration(seconds: number): string {
  if (!seconds) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export function CallTable({ calls, loading }: CallTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PhoneOutgoing className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">No calls yet</p>
        <p className="text-xs text-muted-foreground/70">
          Make your first outbound call or wait for inbound calls
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => {
            const status = statusConfig[call.status] || statusConfig.initiated;
            const StatusIcon = status.icon;

            return (
              <TableRow
                key={call.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/calls/${call.id}`)}
              >
                <TableCell>
                  {call.direction === "inbound" ? (
                    <PhoneIncoming className="h-4 w-4 text-blue-500" />
                  ) : (
                    <PhoneOutgoing className="h-4 w-4 text-green-500" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {call.agent?.name || "Unknown Agent"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {call.direction === "outbound"
                    ? call.to_number
                    : call.from_number || "--"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("gap-1 font-normal", status.color)}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDuration(call.duration_seconds)}
                </TableCell>
                <TableCell
                  className="text-muted-foreground"
                  title={format(new Date(call.started_at), "PPpp")}
                >
                  {formatDistanceToNow(new Date(call.started_at), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
