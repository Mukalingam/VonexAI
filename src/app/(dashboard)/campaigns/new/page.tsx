"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Plus,
  Trash2,
  Loader2,
  Megaphone,
  Bot,
  Phone,
  Users,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Agent, PhoneNumber } from "@/types";

interface Contact {
  phone: string;
  name: string;
  variables: Record<string, string>;
}

interface CampaignSettings {
  max_retries: number;
  retry_delay_minutes: number;
  calling_hours_start: string;
  calling_hours_end: string;
}

const steps = [
  { label: "Setup", icon: Megaphone },
  { label: "Contacts", icon: Users },
  { label: "Review", icon: Settings },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Setup
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Step 2: Contacts
  const [contacts, setContacts] = useState<Contact[]>([
    { phone: "", name: "", variables: {} },
  ]);
  const [csvError, setCsvError] = useState("");

  // Step 3: Settings
  const [settings, setSettings] = useState<CampaignSettings>({
    max_retries: 0,
    retry_delay_minutes: 30,
    calling_hours_start: "09:00",
    calling_hours_end: "17:00",
  });

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [agentsRes, phoneRes] = await Promise.all([
        fetch("/api/agents?channel=calling"),
        fetch("/api/phone-numbers"),
      ]);
      const agentsData = await agentsRes.json();
      const phoneData = await phoneRes.json();

      setAgents(agentsData.agents || []);
      setPhoneNumbers(phoneData.phoneNumbers || phoneData.phone_numbers || []);
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isStep1Valid = name.trim().length >= 2 && agentId && phoneNumberId;
  const isStep2Valid =
    contacts.length > 0 &&
    contacts.every((c) => /^\+[1-9]\d{1,14}$/.test(c.phone));

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          setCsvError("CSV must have a header row and at least one data row");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const phoneIdx = headers.findIndex((h) =>
          ["phone", "phone_number", "number"].includes(h)
        );
        const nameIdx = headers.findIndex((h) => ["name", "contact_name", "full_name"].includes(h));

        if (phoneIdx === -1) {
          setCsvError("CSV must have a 'phone' column");
          return;
        }

        const variableHeaders = headers.filter(
          (_, i) => i !== phoneIdx && i !== nameIdx
        );

        const parsed: Contact[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim());
          const phone = cols[phoneIdx];
          if (!phone) continue;

          const variables: Record<string, string> = {};
          variableHeaders.forEach((header) => {
            const idx = headers.indexOf(header);
            if (cols[idx]) variables[header] = cols[idx];
          });

          parsed.push({
            phone: phone.startsWith("+") ? phone : `+${phone}`,
            name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
            variables,
          });
        }

        if (parsed.length === 0) {
          setCsvError("No valid contacts found in CSV");
          return;
        }

        setContacts(parsed);
      } catch {
        setCsvError("Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
  };

  const addContact = () => {
    setContacts([...contacts, { phone: "", name: "", variables: {} }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    if (field === "variables") return;
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleSave = async (launch: boolean) => {
    setSaving(true);
    try {
      const validContacts = contacts
        .filter((c) => c.phone.trim())
        .map((c) => ({
          phone: c.phone,
          name: c.name || undefined,
          variables:
            Object.keys(c.variables).length > 0 ? c.variables : undefined,
        }));

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          agent_id: agentId,
          phone_number_id: phoneNumberId,
          contacts: validContacts,
          settings,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create campaign");

      if (launch) {
        // Launch immediately
        await fetch(`/api/campaigns/${data.campaign.id}/launch`, {
          method: "POST",
        });
      }

      router.push(`/campaigns/${data.campaign.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New Campaign</h1>
        <p className="text-muted-foreground">
          Set up an outbound calling campaign with your deployed agent
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <button
              onClick={() => {
                if (i < currentStep) setCurrentStep(i);
              }}
              disabled={i > currentStep}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i === currentStep
                  ? "bg-primary text-primary-foreground"
                  : i < currentStep
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
              {step.label}
            </button>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Setup */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Campaign Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="e.g., Mercedes Service Reminder — March 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Agent</Label>
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No calling agents found. Create a Calling Agent first.
                </p>
              ) : (
                <Select value={agentId} onValueChange={setAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a deployed agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {agent.name}
                          <Badge variant="secondary" className="ml-1 text-[10px]">
                            {agent.domain}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              {phoneNumbers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No phone numbers available. Import a phone number first in Call Settings.
                </p>
              ) : (
                <Select value={phoneNumberId} onValueChange={setPhoneNumberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a phone number" />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneNumbers.map((pn) => (
                      <SelectItem key={pn.id} value={pn.id}>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {pn.phone_number}
                          {pn.friendly_name && (
                            <span className="text-muted-foreground">
                              ({pn.friendly_name})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Contacts */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Add Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CSV Upload */}
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">Upload CSV</p>
              <p className="mb-3 text-xs text-muted-foreground">
                Columns: phone (required), name, + any custom variables
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="mx-auto max-w-xs"
              />
              {csvError && (
                <p className="mt-2 text-sm text-destructive">{csvError}</p>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <span className="relative bg-card px-2 text-xs text-muted-foreground">
                OR add manually
              </span>
            </div>

            {/* Manual contacts */}
            <div className="space-y-3">
              {contacts.map((contact, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="+14155551234"
                    value={contact.phone}
                    onChange={(e) => updateContact(i, "phone", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Name (optional)"
                    value={contact.name}
                    onChange={(e) => updateContact(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  {contacts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContact(i)}
                      className="shrink-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addContact}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">
                {contacts.filter((c) => c.phone.trim()).length} contact(s) ready
              </p>
              <p className="text-muted-foreground">
                Phone numbers must be in E.164 format (e.g., +14155551234)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Settings */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Campaign Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Retries</Label>
                  <Select
                    value={settings.max_retries.toString()}
                    onValueChange={(v) =>
                      setSettings({ ...settings, max_retries: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n === 0 ? "No retries" : `${n} ${n === 1 ? "retry" : "retries"}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retry Delay</Label>
                  <Select
                    value={settings.retry_delay_minutes.toString()}
                    onValueChange={(v) =>
                      setSettings({ ...settings, retry_delay_minutes: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Calling Hours Start</Label>
                  <Input
                    type="time"
                    value={settings.calling_hours_start}
                    onChange={(e) =>
                      setSettings({ ...settings, calling_hours_start: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Calling Hours End</Label>
                  <Input
                    type="time"
                    value={settings.calling_hours_end}
                    onChange={(e) =>
                      setSettings({ ...settings, calling_hours_end: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Campaign Name</dt>
                  <dd className="font-medium">{name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Agent</dt>
                  <dd className="font-medium">
                    {agents.find((a) => a.id === agentId)?.name || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Phone Number</dt>
                  <dd className="font-medium">
                    {phoneNumbers.find((p) => p.id === phoneNumberId)?.phone_number || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total Contacts</dt>
                  <dd className="font-medium">
                    {contacts.filter((c) => c.phone.trim()).length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Max Retries</dt>
                  <dd className="font-medium">{settings.max_retries}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Calling Hours</dt>
                  <dd className="font-medium">
                    {settings.calling_hours_start} — {settings.calling_hours_end}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 0 && !isStep1Valid) ||
                (currentStep === 1 && !isStep2Valid)
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Megaphone className="mr-2 h-4 w-4" />
                )}
                Launch Campaign
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
