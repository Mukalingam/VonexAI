"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Loader2,
  Plus,
  Trash2,
  Bot,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PhoneNumber, TelephonyConfig } from "@/types";

interface PhoneNumberManagerProps {
  twilioConfigs: TelephonyConfig[];
}

interface AgentOption {
  id: string;
  name: string;
  domain: string;
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  assigned: "bg-blue-100 text-blue-700",
  error: "bg-red-100 text-red-700",
  importing: "bg-yellow-100 text-yellow-700",
};

const providerLabels: Record<string, string> = {
  twilio: "Twilio",
  exotel: "Exotel",
  plivo: "Plivo",
  telnyx: "Telnyx",
  vonage: "Vonage",
};

export function PhoneNumberManager({
  twilioConfigs,
}: PhoneNumberManagerProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [importNumber, setImportNumber] = useState("");
  const [importFriendlyName, setImportFriendlyName] = useState("");
  const [importConfigId, setImportConfigId] = useState("");
  const [importing, setImporting] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [phoneRes, agentRes] = await Promise.all([
        fetch("/api/phone-numbers"),
        fetch("/api/agents?channel=calling&limit=100"),
      ]);
      const phoneData = await phoneRes.json();
      const agentData = await agentRes.json();
      setPhoneNumbers(phoneData.phone_numbers || []);
      setAgents(agentData.agents || []);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImport = async () => {
    setError("");
    if (!importNumber || !importConfigId) {
      setError("Phone number and account are required");
      return;
    }

    if (!/^\+[1-9]\d{1,14}$/.test(importNumber)) {
      setError("Phone number must be in E.164 format (e.g., +14155551234)");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telephony_config_id: importConfigId,
          phone_number: importNumber,
          friendly_name: importFriendlyName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to import");
      }

      setImportOpen(false);
      setImportNumber("");
      setImportFriendlyName("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setImporting(false);
    }
  };

  const handleAssignAgent = async (phoneNumberId: string, agentId: string) => {
    setAssigningId(phoneNumberId);
    try {
      await fetch(`/api/phone-numbers/${phoneNumberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId || null }),
      });
      fetchData();
    } catch {
      console.error("Failed to assign agent");
    } finally {
      setAssigningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/phone-numbers/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      console.error("Failed to delete phone number");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Phone Numbers</h3>
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={twilioConfigs.length === 0}
            >
              <Plus className="h-3.5 w-3.5" />
              Import Number
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Phone Number</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Phone Account</Label>
                <Select value={importConfigId} onValueChange={setImportConfigId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {twilioConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            [{providerLabels[config.provider] || config.provider}]
                          </span>
                          {config.friendly_name || config.id.slice(0, 8)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+14155551234"
                  value={importNumber}
                  onChange={(e) => setImportNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Must be in E.164 format
                </p>
              </div>

              <div className="space-y-2">
                <Label>Label (Optional)</Label>
                <Input
                  placeholder="Main Office Line"
                  value={importFriendlyName}
                  onChange={(e) => setImportFriendlyName(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                onClick={handleImport}
                disabled={importing || !importNumber || !importConfigId}
                className="w-full bg-[#2E3192] hover:bg-[#2E3192]/90"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import Number"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {twilioConfigs.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Connect an account above to import phone numbers.
          </CardContent>
        </Card>
      )}

      {phoneNumbers.length === 0 && twilioConfigs.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            <Phone className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No phone numbers imported yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Click &quot;Import Number&quot; to add a phone number
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {phoneNumbers.map((pn) => (
          <Card key={pn.id}>
            <CardContent className="flex items-center gap-4 py-3">
              <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{pn.phone_number}</p>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", statusColors[pn.status])}
                  >
                    {pn.status}
                  </Badge>
                  {pn.provider && pn.provider !== "twilio" && (
                    <Badge variant="outline" className="text-xs">
                      {providerLabels[pn.provider] || pn.provider}
                    </Badge>
                  )}
                </div>
                {pn.friendly_name && (
                  <p className="text-xs text-muted-foreground">
                    {pn.friendly_name}
                  </p>
                )}
              </div>

              {/* Agent assignment */}
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={pn.agent_id || ""}
                  onValueChange={(value) => handleAssignAgent(pn.id, value)}
                  disabled={assigningId === pn.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign agent">
                      {pn.agent ? (
                        <span className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          {pn.agent.name}
                        </span>
                      ) : (
                        "Assign agent"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleDelete(pn.id)}
                disabled={deletingId === pn.id}
              >
                {deletingId === pn.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
