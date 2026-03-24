"use client";

import { useState, useEffect } from "react";
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Agent {
  id: string;
  name: string;
  domain: string;
  elevenlabs_agent_id: string | null;
}

interface PhoneNumberOption {
  id: string;
  phone_number: string;
  friendly_name: string | null;
  agent_id: string | null;
  status: string;
}

interface OutboundCallDialogProps {
  onCallInitiated?: () => void;
}

export function OutboundCallDialog({ onCallInitiated }: OutboundCallDialogProps) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberOption[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    // Fetch calling agents and all usable phone numbers
    Promise.all([
      fetch("/api/agents?channel=calling&limit=100").then((r) => r.json()),
      fetch("/api/phone-numbers").then((r) => r.json()),
    ]).then(([agentData, phoneData]) => {
      setAgents(agentData.agents || []);
      // Show available and assigned phone numbers (exclude error/importing)
      const usable = (phoneData.phone_numbers || []).filter(
        (pn: PhoneNumberOption) =>
          pn.status === "available" || pn.status === "assigned"
      );
      setPhoneNumbers(usable);
    });
  }, [open]);

  const handleCall = async () => {
    setError("");
    if (!selectedAgent || !selectedPhoneNumber || !toNumber) {
      setError("Please fill all fields");
      return;
    }

    if (!/^\+[1-9]\d{1,14}$/.test(toNumber)) {
      setError("Phone number must be in E.164 format (e.g., +14155551234)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: selectedAgent,
          phone_number_id: selectedPhoneNumber,
          to_number: toNumber,
          ...(contactName.trim() ? { contact_name: contactName.trim() } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to initiate call");
      }

      setOpen(false);
      setToNumber("");
      setContactName("");
      setSelectedAgent("");
      setSelectedPhoneNumber("");
      onCallInitiated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#2E3192] hover:bg-[#2E3192]/90">
          <Phone className="h-4 w-4" />
          Make a Call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Outbound Call</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Agent</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {agents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No calling agents found. Create a Calling Agent first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>From Number</Label>
            <Select
              value={selectedPhoneNumber}
              onValueChange={setSelectedPhoneNumber}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select phone number" />
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((pn) => (
                  <SelectItem key={pn.id} value={pn.id}>
                    {pn.friendly_name
                      ? `${pn.friendly_name} (${pn.phone_number})`
                      : pn.phone_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {phoneNumbers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No phone numbers available. Import numbers in Settings.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input
              placeholder="e.g., John, Rahul"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Agent will greet the contact by name
            </p>
          </div>

          <div className="space-y-2">
            <Label>To Number</Label>
            <Input
              placeholder="+14155551234"
              value={toNumber}
              onChange={(e) => setToNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the destination number in E.164 format
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleCall}
            disabled={loading || !selectedAgent || !selectedPhoneNumber || !toNumber}
            className="w-full gap-2 bg-[#2E3192] hover:bg-[#2E3192]/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Phone className="h-4 w-4" />
            )}
            {loading ? "Calling..." : "Start Call"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
