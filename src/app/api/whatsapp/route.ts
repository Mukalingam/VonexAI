import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/whatsapp - Send a WhatsApp message via Twilio
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to_number, message, call_log_id, template_name } = body;

    if (!to_number || !message) {
      return NextResponse.json({ error: "to_number and message are required" }, { status: 400 });
    }

    // Get user's Twilio config for WhatsApp (use first active one)
    const { data: twilioConfig } = await supabase
      .from("twilio_configs")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (!twilioConfig) {
      // Try telephony_configs
      const { data: telConfig } = await supabase
        .from("telephony_configs")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "twilio")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!telConfig) {
        return NextResponse.json(
          { error: "No Twilio account configured. Add Twilio credentials in Phone Call Settings." },
          { status: 400 }
        );
      }

      // Send via telephony_configs credentials
      const creds = telConfig.credentials as Record<string, string>;
      return await sendWhatsAppMessage({
        supabase,
        userId: user.id,
        accountSid: creds.account_sid,
        authToken: creds.auth_token,
        toNumber: to_number,
        message,
        callLogId: call_log_id,
        templateName: template_name,
      });
    }

    return await sendWhatsAppMessage({
      supabase,
      userId: user.id,
      accountSid: twilioConfig.account_sid,
      authToken: twilioConfig.auth_token,
      toNumber: to_number,
      message,
      callLogId: call_log_id,
      templateName: template_name,
    });
  } catch (error) {
    console.error("Error in POST /api/whatsapp:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function sendWhatsAppMessage({
  supabase,
  userId,
  accountSid,
  authToken,
  toNumber,
  message,
  callLogId,
  templateName,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  accountSid: string;
  authToken: string;
  toNumber: string;
  message: string;
  callLogId?: string;
  templateName?: string;
}) {
  // Format numbers for WhatsApp
  const whatsappTo = toNumber.startsWith("whatsapp:") ? toNumber : `whatsapp:${toNumber}`;
  const whatsappFrom = `whatsapp:+14155238886`; // Twilio sandbox default
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const twilioAuth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  // Try to get/create a content template for sending outside 24h window
  let contentSid: string | null = null;
  try {
    const listRes = await fetch("https://content.twilio.com/v1/Content?PageSize=50", {
      headers: { Authorization: twilioAuth },
    });
    if (listRes.ok) {
      const listData = await listRes.json();
      const existing = (listData.contents || []).find(
        (c: { friendly_name: string }) => c.friendly_name === "vonexai_call_followup"
      );
      if (existing) {
        contentSid = existing.sid;
      } else {
        // Create template
        const createRes = await fetch("https://content.twilio.com/v1/Content", {
          method: "POST",
          headers: { Authorization: twilioAuth, "Content-Type": "application/json" },
          body: JSON.stringify({
            friendly_name: "vonexai_call_followup",
            language: "en",
            variables: { "1": "follow-up details" },
            types: { "twilio/text": { body: "{{1}}" } },
          }),
        });
        if (createRes.ok) {
          const template = await createRes.json();
          contentSid = template.sid;
          // Submit for WhatsApp approval
          await fetch(`https://content.twilio.com/v1/Content/${template.sid}/ApprovalRequests/whatsapp`, {
            method: "POST",
            headers: { Authorization: twilioAuth, "Content-Type": "application/json" },
            body: JSON.stringify({ name: "vonexai_call_followup", category: "UTILITY" }),
          }).catch(() => {});
        }
      }
    }
  } catch { /* Template API not available, will try freeform */ }

  // Send: try template first, fallback to freeform
  let res: Response;
  if (contentSid) {
    const formBody = new URLSearchParams({
      To: whatsappTo,
      From: whatsappFrom,
      ContentSid: contentSid,
      ContentVariables: JSON.stringify({ "1": message }),
    });
    res = await fetch(twilioUrl, {
      method: "POST",
      headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });

    // If template fails, try freeform
    if (!res.ok) {
      const formBody2 = new URLSearchParams({ To: whatsappTo, From: whatsappFrom, Body: message });
      res = await fetch(twilioUrl, {
        method: "POST",
        headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody2.toString(),
      });
    }
  } else {
    const formBody = new URLSearchParams({ To: whatsappTo, From: whatsappFrom, Body: message });
    res = await fetch(twilioUrl, {
      method: "POST",
      headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });
  }

  const result = await res.json();

  if (!res.ok) {
    console.error("[WhatsApp] Send failed:", result);
    return NextResponse.json(
      { error: result.message || "Failed to send WhatsApp message" },
      { status: 502 }
    );
  }

  // Log the message
  await supabase.from("whatsapp_messages").insert({
    user_id: userId,
    call_log_id: callLogId || null,
    to_number: toNumber,
    from_number: whatsappFrom.replace("whatsapp:", ""),
    message_type: templateName ? "template" : "text",
    template_name: templateName || null,
    content: message,
    status: "sent",
    twilio_message_sid: result.sid,
    metadata: { twilio_response: { sid: result.sid, status: result.status } },
  });

  console.log("[WhatsApp] Message sent:", { sid: result.sid, to: toNumber });

  return NextResponse.json({
    success: true,
    message_sid: result.sid,
    status: result.status,
  });
}

// GET /api/whatsapp - List sent messages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const callLogId = searchParams.get("call_log_id");

    let query = supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (callLogId) query = query.eq("call_log_id", callLogId);

    const { data: messages, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Error in GET /api/whatsapp:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
