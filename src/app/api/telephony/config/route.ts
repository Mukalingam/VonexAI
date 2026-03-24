import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { telephonyConfigSchema } from "@/lib/validations";

// Provider-specific credential validation
const PROVIDER_FIELDS: Record<string, { required: string[]; labels: Record<string, string> }> = {
  twilio: {
    required: ["account_sid", "auth_token"],
    labels: { account_sid: "Account SID", auth_token: "Auth Token" },
  },
  exotel: {
    required: ["api_key", "api_token", "subdomain"],
    labels: { api_key: "API Key", api_token: "API Token", subdomain: "Subdomain (e.g., mycompany)" },
  },
  plivo: {
    required: ["auth_id", "auth_token"],
    labels: { auth_id: "Auth ID", auth_token: "Auth Token" },
  },
  telnyx: {
    required: ["api_key"],
    labels: { api_key: "API Key" },
  },
  vonage: {
    required: ["api_key", "api_secret"],
    labels: { api_key: "API Key", api_secret: "API Secret" },
  },
};

// Verify credentials against provider API
async function verifyCredentials(provider: string, credentials: Record<string, string>): Promise<boolean> {
  try {
    switch (provider) {
      case "twilio": {
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${credentials.account_sid}.json`,
          {
            headers: {
              Authorization: "Basic " + Buffer.from(`${credentials.account_sid}:${credentials.auth_token}`).toString("base64"),
            },
          }
        );
        return res.ok;
      }
      case "plivo": {
        const res = await fetch(
          `https://api.plivo.com/v1/Account/${credentials.auth_id}/`,
          {
            headers: {
              Authorization: "Basic " + Buffer.from(`${credentials.auth_id}:${credentials.auth_token}`).toString("base64"),
            },
          }
        );
        return res.ok;
      }
      case "telnyx": {
        const res = await fetch("https://api.telnyx.com/v2/available_phone_numbers?filter[limit]=1", {
          headers: { Authorization: `Bearer ${credentials.api_key}` },
        });
        return res.ok;
      }
      case "vonage": {
        const res = await fetch(
          `https://rest.nexmo.com/account/get-balance?api_key=${credentials.api_key}&api_secret=${credentials.api_secret}`
        );
        return res.ok;
      }
      case "exotel": {
        const res = await fetch(
          `https://${credentials.subdomain}.exotel.com/v1/Accounts/${credentials.api_key}`,
          {
            headers: {
              Authorization: "Basic " + Buffer.from(`${credentials.api_key}:${credentials.api_token}`).toString("base64"),
            },
          }
        );
        // Exotel returns 200 or 401
        return res.ok || res.status === 200;
      }
      default:
        return true;
    }
  } catch {
    return false;
  }
}

// GET /api/telephony/config - List all telephony configs
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch from both tables for backward compat
    const [telephonyResult, twilioResult] = await Promise.all([
      supabase
        .from("telephony_configs")
        .select("id, user_id, provider, friendly_name, is_active, created_at, updated_at, credentials")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("twilio_configs")
        .select("id, user_id, account_sid, friendly_name, is_active, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const telephonyConfigs = (telephonyResult.data || []).map((c) => ({
      ...c,
      // Strip sensitive tokens from response - only show partial
      credentials: Object.fromEntries(
        Object.entries(c.credentials as Record<string, string>).map(([k, v]) => [
          k,
          typeof v === "string" && v.length > 8 ? v.slice(0, 4) + "..." + v.slice(-4) : v,
        ])
      ),
    }));

    // Merge twilio configs not already in telephony_configs
    const telephonyIds = new Set(telephonyConfigs.map((c) => c.id));
    const legacyTwilio = (twilioResult.data || [])
      .filter((c) => !telephonyIds.has(c.id))
      .map((c) => ({
        id: c.id,
        user_id: c.user_id,
        provider: "twilio" as const,
        friendly_name: c.friendly_name,
        is_active: c.is_active,
        created_at: c.created_at,
        updated_at: c.updated_at,
        credentials: {
          account_sid: c.account_sid.slice(0, 4) + "..." + c.account_sid.slice(-4),
        },
      }));

    return NextResponse.json({
      configs: [...telephonyConfigs, ...legacyTwilio],
      provider_fields: PROVIDER_FIELDS,
    });
  } catch (error) {
    console.error("Error in GET /api/telephony/config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/telephony/config - Save telephony credentials
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = telephonyConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { provider, credentials, friendly_name } = parsed.data;

    // Validate required fields for this provider
    const providerInfo = PROVIDER_FIELDS[provider];
    if (!providerInfo) {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    for (const field of providerInfo.required) {
      if (!credentials[field]) {
        return NextResponse.json(
          { error: `${providerInfo.labels[field] || field} is required` },
          { status: 400 }
        );
      }
    }

    // Verify credentials
    const valid = await verifyCredentials(provider, credentials);
    if (!valid) {
      return NextResponse.json(
        { error: `Invalid ${provider} credentials. Please verify and try again.` },
        { status: 400 }
      );
    }

    // Save to telephony_configs
    const { data: config, error } = await supabase
      .from("telephony_configs")
      .insert({
        user_id: user.id,
        provider,
        credentials,
        friendly_name: friendly_name || `${provider} account`,
        is_active: true,
      })
      .select("id, user_id, provider, friendly_name, is_active, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error saving telephony config:", error);
      return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
    }

    // Also save to twilio_configs for backward compat if it's Twilio
    if (provider === "twilio") {
      await supabase.from("twilio_configs").upsert(
        {
          id: config.id,
          user_id: user.id,
          account_sid: credentials.account_sid,
          auth_token: credentials.auth_token,
          friendly_name: friendly_name || null,
          is_active: true,
        },
        { onConflict: "user_id,account_sid" }
      );
    }

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/telephony/config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
