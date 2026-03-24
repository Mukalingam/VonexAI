import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { phoneNumberImportSchema } from "@/lib/validations";
import { importTwilioPhoneNumber } from "@/lib/elevenlabs";

// GET /api/phone-numbers - List user's phone numbers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const agentId = searchParams.get("agent_id");

    let query = supabase
      .from("phone_numbers")
      .select("*, agent:agents(id, name, domain, status), twilio_config:twilio_configs(id, account_sid, friendly_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (agentId) query = query.eq("agent_id", agentId);

    const { data: phoneNumbers, error } = await query;

    if (error) {
      console.error("Error fetching phone numbers:", error);
      return NextResponse.json(
        { error: "Failed to fetch phone numbers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ phone_numbers: phoneNumbers || [] });
  } catch (error) {
    console.error("Error in GET /api/phone-numbers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/phone-numbers - Import a phone number via ElevenLabs (multi-provider)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = phoneNumberImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const configId = parsed.data.telephony_config_id;

    // Try to get config from telephony_configs first, then fallback to twilio_configs
    let provider = "twilio";
    let credentials: Record<string, string> = {};

    const { data: telephonyConfig } = await supabase
      .from("telephony_configs")
      .select("*")
      .eq("id", configId)
      .eq("user_id", user.id)
      .single();

    if (telephonyConfig) {
      provider = telephonyConfig.provider;
      credentials = telephonyConfig.credentials as Record<string, string>;
    } else {
      // Fallback to twilio_configs
      const { data: twilioConfig, error: configError } = await supabase
        .from("twilio_configs")
        .select("*")
        .eq("id", configId)
        .eq("user_id", user.id)
        .single();

      if (configError || !twilioConfig) {
        return NextResponse.json(
          { error: "Phone provider configuration not found" },
          { status: 404 }
        );
      }

      provider = "twilio";
      credentials = {
        account_sid: twilioConfig.account_sid,
        auth_token: twilioConfig.auth_token,
      };
    }

    // Check for duplicate phone number
    const { data: existing } = await supabase
      .from("phone_numbers")
      .select("id")
      .eq("user_id", user.id)
      .eq("phone_number", parsed.data.phone_number)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This phone number has already been imported" },
        { status: 409 }
      );
    }

    // Create a pending record
    const { data: phoneRecord, error: insertError } = await supabase
      .from("phone_numbers")
      .insert({
        user_id: user.id,
        twilio_config_id: configId,
        telephony_config_id: configId,
        provider,
        phone_number: parsed.data.phone_number,
        friendly_name: parsed.data.friendly_name || null,
        status: "importing",
      })
      .select()
      .single();

    if (insertError || !phoneRecord) {
      console.error("Error creating phone number record:", insertError);
      return NextResponse.json(
        { error: "Failed to create phone number record" },
        { status: 500 }
      );
    }

    try {
      // Import into ElevenLabs - ElevenLabs supports multiple providers
      const elevenLabsProvider = mapToElevenLabsProvider(provider);
      const importPayload = buildElevenLabsImportPayload(
        elevenLabsProvider,
        parsed.data.phone_number,
        credentials,
        parsed.data.friendly_name
      );

      const elevenLabsResult = await importPhoneNumberToElevenLabs(importPayload);

      // Update with ElevenLabs phone number ID
      const { data: updated, error: updateError } = await supabase
        .from("phone_numbers")
        .update({
          elevenlabs_phone_number_id: elevenLabsResult.phone_number_id || elevenLabsResult.id,
          status: "available",
        })
        .eq("id", phoneRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating phone number:", updateError);
      }

      return NextResponse.json(updated || phoneRecord, { status: 201 });
    } catch (elevenLabsError) {
      // Mark as error if ElevenLabs import fails
      await supabase
        .from("phone_numbers")
        .update({ status: "error" })
        .eq("id", phoneRecord.id);

      console.error("ElevenLabs phone import failed:", elevenLabsError);
      return NextResponse.json(
        {
          error:
            elevenLabsError instanceof Error
              ? elevenLabsError.message
              : "Failed to import phone number to ElevenLabs",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/phone-numbers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Map our provider names to ElevenLabs provider names
function mapToElevenLabsProvider(provider: string): string {
  const map: Record<string, string> = {
    twilio: "twilio",
    plivo: "plivo",
    telnyx: "telnyx",
    vonage: "vonage",
    exotel: "exotel",
  };
  return map[provider] || "twilio";
}

// Build the import payload based on provider
function buildElevenLabsImportPayload(
  provider: string,
  phoneNumber: string,
  credentials: Record<string, string>,
  label?: string | null,
) {
  const base = { phone_number: phoneNumber, provider, ...(label && { label }) };

  switch (provider) {
    case "twilio":
      return { ...base, sid: credentials.account_sid, token: credentials.auth_token };
    case "plivo":
      return { ...base, sid: credentials.auth_id, token: credentials.auth_token };
    case "telnyx":
      return { ...base, api_key: credentials.api_key };
    case "vonage":
      return { ...base, api_key: credentials.api_key, api_secret: credentials.api_secret };
    case "exotel":
      return { ...base, api_key: credentials.api_key, api_token: credentials.api_token, subdomain: credentials.subdomain };
    default:
      return base;
  }
}

// Generic ElevenLabs phone number import
async function importPhoneNumberToElevenLabs(payload: Record<string, unknown>) {
  const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
  const res = await fetch(`${ELEVENLABS_API_URL}/convai/phone-numbers/create`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to import phone number: ${error}`);
  }
  return res.json();
}
