import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { twilioConfigSchema } from "@/lib/validations";

// GET /api/twilio/config - List user's Twilio configurations
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: configs, error } = await supabase
      .from("twilio_configs")
      .select("id, user_id, account_sid, friendly_name, is_active, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching Twilio configs:", error);
      return NextResponse.json(
        { error: "Failed to fetch Twilio configurations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ configs: configs || [] });
  } catch (error) {
    console.error("Error in GET /api/twilio/config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/twilio/config - Save Twilio credentials
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
    const parsed = twilioConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify Twilio credentials by calling the Twilio API
    const twilioVerifyRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${parsed.data.account_sid}.json`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${parsed.data.account_sid}:${parsed.data.auth_token}`
            ).toString("base64"),
        },
      }
    );

    if (!twilioVerifyRes.ok) {
      return NextResponse.json(
        { error: "Invalid Twilio credentials. Please verify your Account SID and Auth Token." },
        { status: 400 }
      );
    }

    const twilioAccount = await twilioVerifyRes.json();

    const { data: config, error } = await supabase
      .from("twilio_configs")
      .upsert(
        {
          user_id: user.id,
          account_sid: parsed.data.account_sid,
          auth_token: parsed.data.auth_token,
          friendly_name:
            parsed.data.friendly_name || twilioAccount.friendly_name || null,
          is_active: true,
        },
        { onConflict: "user_id,account_sid" }
      )
      .select("id, user_id, account_sid, friendly_name, is_active, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error saving Twilio config:", error);
      return NextResponse.json(
        { error: "Failed to save Twilio configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/twilio/config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
