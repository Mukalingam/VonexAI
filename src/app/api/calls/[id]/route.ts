import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConversation } from "@/lib/elevenlabs";

/**
 * Trigger WhatsApp auto-send when viewing a call that just completed.
 * Analyzes transcript and sends WhatsApp if agent promised to.
 */
async function triggerWhatsAppAutoSendFromDetail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  callLogId: string,
  userId: string
) {
  try {
    const { data: call } = await supabase
      .from("call_logs")
      .select("id, transcript, to_number, from_number, direction, metadata, agent_id, agents(name)")
      .eq("id", callLogId)
      .single();

    if (!call?.transcript) return;

    // Check if already sent
    const { data: existing } = await supabase
      .from("whatsapp_messages")
      .select("id")
      .eq("call_log_id", callLogId)
      .limit(1);
    if (existing && existing.length > 0) return;

    const transcript = call.transcript as { role: string; text: string }[];
    if (transcript.length < 2) return;

    const conversationText = transcript
      .map((m) => `${m.role === "agent" ? "Agent" : "Customer"}: ${m.text}`)
      .join("\n");

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: `Analyze this call transcript. Did the AI agent promise to send information via WhatsApp?

Transcript:
${conversationText}

Respond ONLY with JSON (no markdown):
{
  "should_send": true/false,
  "message": "The WhatsApp message to send with relevant details from the call"
}

If agent promised to send details/pricing/confirmation on WhatsApp, compose a professional message.`,
      }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") return;

    let analysis: { should_send: boolean; message: string };
    try {
      analysis = JSON.parse(textContent.text);
    } catch {
      const match = textContent.text.match(/\{[\s\S]*\}/);
      if (!match) return;
      analysis = JSON.parse(match[0]);
    }

    if (!analysis.should_send) return;

    const customerNumber = call.direction === "outbound" ? call.to_number : call.from_number;
    if (!customerNumber) return;

    // Get Twilio credentials
    let accountSid = "", authToken = "";
    const { data: twilioConfig } = await supabase
      .from("twilio_configs")
      .select("account_sid, auth_token")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (twilioConfig) {
      accountSid = twilioConfig.account_sid;
      authToken = twilioConfig.auth_token;
    } else {
      const { data: telConfig } = await supabase
        .from("telephony_configs")
        .select("credentials")
        .eq("user_id", userId)
        .eq("provider", "twilio")
        .eq("is_active", true)
        .limit(1)
        .single();
      if (!telConfig) return;
      const creds = telConfig.credentials as Record<string, string>;
      accountSid = creds.account_sid;
      authToken = creds.auth_token;
    }

    const whatsappTo = `whatsapp:${customerNumber}`;
    const whatsappFrom = `whatsapp:+14155238886`;
    const twilioAuth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const twilioMsgUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Try template first, then freeform
    let contentSid: string | null = null;
    try {
      const listRes = await fetch("https://content.twilio.com/v1/Content?PageSize=50", {
        headers: { Authorization: twilioAuth },
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        const tmpl = (listData.contents || []).find(
          (c: { friendly_name: string }) => c.friendly_name === "vonexai_call_followup"
        );
        if (tmpl) contentSid = tmpl.sid;
      }
    } catch { /* ignore */ }

    let res: Response;
    if (contentSid) {
      const formBody = new URLSearchParams({
        To: whatsappTo, From: whatsappFrom,
        ContentSid: contentSid,
        ContentVariables: JSON.stringify({ "1": analysis.message }),
      });
      res = await fetch(twilioMsgUrl, {
        method: "POST",
        headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });
      if (!res.ok) {
        // Fallback to freeform
        const fb = new URLSearchParams({ To: whatsappTo, From: whatsappFrom, Body: analysis.message });
        res = await fetch(twilioMsgUrl, {
          method: "POST",
          headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
          body: fb.toString(),
        });
      }
    } else {
      const formBody = new URLSearchParams({ To: whatsappTo, From: whatsappFrom, Body: analysis.message });
      res = await fetch(twilioMsgUrl, {
        method: "POST",
        headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });
    }

    const result = await res.json();
    await supabase.from("whatsapp_messages").insert({
      user_id: userId,
      call_log_id: callLogId,
      to_number: customerNumber,
      from_number: "+14155238886",
      message_type: contentSid ? "template" : "text",
      content: analysis.message,
      status: res.ok ? "sent" : "failed",
      twilio_message_sid: (result as { sid?: string }).sid || null,
      metadata: { ai_generated: true, auto_sent: true },
    });

    console.log("[WhatsApp Auto-Detail] Sent:", { callLogId, to: customerNumber, ok: res.ok });
  } catch (err) {
    console.error("[WhatsApp Auto-Detail] Failed:", err);
  }
}

// GET /api/calls/[id] - Get call detail with transcript (lazy-fetch from ElevenLabs)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: callLog, error } = await supabase
      .from("call_logs")
      .select(
        "*, agent:agents(id, name, domain, voice_id), phone_number:phone_numbers(id, phone_number, friendly_name)"
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !callLog) {
      return NextResponse.json(
        { error: "Call not found" },
        { status: 404 }
      );
    }

    // If we have an ElevenLabs conversation ID and data is stale, fetch latest
    const isStale =
      !callLog.transcript ||
      ["initiated", "ringing", "in_progress"].includes(callLog.status);

    if (callLog.elevenlabs_conversation_id && isStale) {
      try {
        const conversation = await getConversation(
          callLog.elevenlabs_conversation_id
        );

        const updates: Record<string, unknown> = {};

        // Extract transcript — ElevenLabs uses "message" + "time_in_call_secs",
        // our app uses "text" + "timestamp", so we normalise here.
        if (conversation.transcript && conversation.transcript.length > 0) {
          updates.transcript = conversation.transcript.map(
            (entry: Record<string, unknown>) => ({
              role: entry.role,
              text: entry.message || entry.text || "",
              timestamp: entry.time_in_call_secs ?? entry.timestamp,
            })
          );
        }

        // Update status based on ElevenLabs data
        if (conversation.status === "done" || conversation.status === "completed") {
          updates.status = "completed";
          if (conversation.metadata?.call_duration_secs) {
            updates.duration_seconds = Math.round(
              conversation.metadata.call_duration_secs
            );
          }
          if (!callLog.ended_at) {
            updates.ended_at = new Date().toISOString();
          }
        }

        // Extract analysis/sentiment if available
        if (conversation.analysis?.call_successful !== undefined) {
          updates.metadata = {
            ...(callLog.metadata || {}),
            call_successful: conversation.analysis.call_successful,
            call_summary: conversation.analysis.summary || null,
          };
        }

        if (Object.keys(updates).length > 0) {
          const { data: updated } = await supabase
            .from("call_logs")
            .update(updates)
            .eq("id", id)
            .select(
              "*, agent:agents(id, name, domain, voice_id), phone_number:phone_numbers(id, phone_number, friendly_name)"
            )
            .single();

          // Trigger WhatsApp auto-send when call just transitioned to completed
          if (
            updates.status === "completed" &&
            callLog.status !== "completed" &&
            updated?.transcript
          ) {
            triggerWhatsAppAutoSendFromDetail(supabase, id, user.id).catch(() => {});
          }

          if (updated) return NextResponse.json(updated);
        }
      } catch (fetchErr) {
        console.error("Failed to fetch conversation from ElevenLabs:", fetchErr);
        // Continue with cached data
      }
    }

    // Auto-trigger WhatsApp for completed calls that haven't had one sent yet
    if (callLog.status === "completed" && callLog.transcript) {
      triggerWhatsAppAutoSendFromDetail(supabase, id, user.id).catch(() => {});
    }

    return NextResponse.json(callLog);
  } catch (error) {
    console.error("Error in GET /api/calls/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
