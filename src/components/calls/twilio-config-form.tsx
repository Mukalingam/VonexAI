"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TelephonyConfig, TelephonyProvider } from "@/types";

const PROVIDER_INFO: Record<TelephonyProvider, {
  label: string;
  color: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
}> = {
  twilio: {
    label: "Twilio",
    color: "text-red-600",
    fields: [
      { key: "account_sid", label: "Account SID", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "auth_token", label: "Auth Token", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", secret: true },
    ],
  },
  exotel: {
    label: "Exotel",
    color: "text-blue-600",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Your Exotel API Key" },
      { key: "api_token", label: "API Token", placeholder: "Your Exotel API Token", secret: true },
      { key: "subdomain", label: "Subdomain", placeholder: "mycompany (from mycompany.exotel.com)" },
    ],
  },
  plivo: {
    label: "Plivo",
    color: "text-green-600",
    fields: [
      { key: "auth_id", label: "Auth ID", placeholder: "Your Plivo Auth ID" },
      { key: "auth_token", label: "Auth Token", placeholder: "Your Plivo Auth Token", secret: true },
    ],
  },
  telnyx: {
    label: "Telnyx",
    color: "text-emerald-600",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "KEY_xxxxxxxxxxxxx", secret: true },
    ],
  },
  vonage: {
    label: "Vonage",
    color: "text-purple-600",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Your Vonage API Key" },
      { key: "api_secret", label: "API Secret", placeholder: "Your Vonage API Secret", secret: true },
    ],
  },
};

interface TwilioConfigFormProps {
  configs: TelephonyConfig[];
  onSaved: () => void;
}

export function TwilioConfigForm({ configs, onSaved }: TwilioConfigFormProps) {
  const [provider, setProvider] = useState<TelephonyProvider>("twilio");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [friendlyName, setFriendlyName] = useState("");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const providerInfo = PROVIDER_INFO[provider];

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Check all required fields
    for (const field of providerInfo.fields) {
      if (!credentials[field.key]) {
        setError(`${field.label} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/telephony/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          credentials,
          friendly_name: friendlyName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess(`${providerInfo.label} credentials verified and saved!`);
      setCredentials({});
      setFriendlyName("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/telephony/config/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing configs */}
      {configs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Connected Accounts</h3>
          {configs.map((config) => {
            const pi = PROVIDER_INFO[config.provider as TelephonyProvider] || PROVIDER_INFO.twilio;
            return (
              <Card key={config.id} className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {config.friendly_name || pi.label}
                        <span className={`ml-2 text-xs font-normal ${pi.color}`}>
                          {pi.label}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {config.provider === "twilio" && config.credentials?.account_sid
                          ? `SID: ${config.credentials.account_sid}`
                          : `Provider: ${pi.label}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(config.id)}
                    disabled={deletingId === config.id}
                  >
                    {deletingId === config.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add new config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {configs.length > 0 ? "Add Another Account" : "Connect Phone Provider"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider selector */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => { setProvider(v as TelephonyProvider); setCredentials({}); setError(""); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Friendly Name (Optional)</Label>
            <Input
              placeholder={`My ${providerInfo.label} Account`}
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
            />
          </div>

          {/* Dynamic credential fields */}
          {providerInfo.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <div className="relative">
                <Input
                  type={field.secret && !showSecrets[field.key] ? "password" : "text"}
                  placeholder={field.placeholder}
                  value={credentials[field.key] || ""}
                  onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                  className={field.secret ? "pr-10 font-mono text-sm" : "font-mono text-sm"}
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !showSecrets[field.key] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#2E3192] hover:bg-[#2E3192]/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying & Saving...
              </>
            ) : (
              `Save & Verify ${providerInfo.label} Credentials`
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Your credentials are encrypted and stored securely. We verify them
            against the provider API before saving.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
