"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TwilioConfigForm } from "@/components/calls/twilio-config-form";
import { PhoneNumberManager } from "@/components/calls/phone-number-manager";
import { Separator } from "@/components/ui/separator";
import type { TelephonyConfig } from "@/types";

export default function CallSettingsPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<TelephonyConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    try {
      // Try new API first, fallback to old
      const res = await fetch("/api/telephony/config");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
      } else {
        const res2 = await fetch("/api/twilio/config");
        const data = await res2.json();
        // Map old format to new
        setConfigs((data.configs || []).map((c: { id: string; user_id: string; account_sid: string; friendly_name: string | null; is_active: boolean; created_at: string; updated_at: string }) => ({
          ...c,
          provider: "twilio" as const,
          credentials: { account_sid: c.account_sid },
        })));
      }
    } catch (err) {
      console.error("Failed to fetch configs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/calls")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Phone Call Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect your phone provider and manage phone numbers
          </p>
        </div>
      </div>

      {/* Telephony Provider Credentials */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Phone Provider</h2>
        <TwilioConfigForm configs={configs} onSaved={fetchConfigs} />
      </section>

      <Separator />

      {/* Phone Numbers */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Phone Numbers</h2>
        <PhoneNumberManager twilioConfigs={configs} />
      </section>
    </div>
  );
}
