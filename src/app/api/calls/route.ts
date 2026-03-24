import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { outboundCallSchema } from "@/lib/validations";
import { makeOutboundCall, getConversation, listConversations, updateElevenLabsPhoneNumber } from "@/lib/elevenlabs";

/**
 * Create a Twilio Content Template for WhatsApp messaging.
 * Returns the ContentSid if successful, null otherwise.
 */
async function getOrCreateWhatsAppTemplate(
  accountSid: string,
  twilioAuth: string,
  messageBody: string
): Promise<string | null> {
  try {
    // First, list existing templates to see if we have one we can reuse
    const listRes = await fetch("https://content.twilio.com/v1/Content?PageSize=50", {
      headers: { Authorization: twilioAuth },
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      const contents = listData.contents || [];

      // Look for our previously created follow-up template
      const existing = contents.find(
        (c: { friendly_name: string }) => c.friendly_name === "vonexai_call_followup"
      );
      if (existing) {
        return existing.sid;
      }
    }

    // Create a new template with the message
    // Use a simple text template with one variable for the full message
    const createRes = await fetch("https://content.twilio.com/v1/Content", {
      method: "POST",
      headers: {
        Authorization: twilioAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        friendly_name: "vonexai_call_followup",
        language: "en",
        variables: { "1": "follow-up details" },
        types: {
          "twilio/text": {
            body: "{{1}}",
          },
        },
      }),
    });

    if (createRes.ok) {
      const template = await createRes.json();
      console.log("[WhatsApp] Created template:", template.sid);

      // Submit for approval (required for WhatsApp)
      try {
        await fetch(`https://content.twilio.com/v1/Content/${template.sid}/ApprovalRequests/whatsapp`, {
          method: "POST",
          headers: {
            Authorization: twilioAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "vonexai_call_followup",
            category: "UTILITY",
          }),
        });
      } catch {
        // Approval submission may fail on sandbox - that's ok
      }

      return template.sid;
    }

    console.log("[WhatsApp] Template creation failed:", await createRes.text());
    return null;
  } catch (err) {
    console.error("[WhatsApp] Template error:", err);
    return null;
  }
}

/**
 * Fire-and-forget: analyze call transcript and auto-send WhatsApp if agent promised to.
 */
async function triggerWhatsAppAutoSend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  callLogId: string,
  userId: string
) {
  try {
    // Get call with transcript
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

    // Use Claude to check if WhatsApp was promised
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

If agent promised to send details/pricing/confirmation on WhatsApp, compose a professional message with the specific info discussed.`,
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

    // Get Twilio credentials for WhatsApp
    let accountSid = "";
    let authToken = "";

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

    // Send WhatsApp via Twilio using Content Template API
    const whatsappTo = `whatsapp:${customerNumber}`;
    const whatsappFrom = `whatsapp:+14155238886`;
    const twilioAuth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const twilioMsgUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Step 1: Create a content template with the AI-generated message
    const contentSid = await getOrCreateWhatsAppTemplate(accountSid, twilioAuth, analysis.message);

    let res: Response;
    let result: Record<string, unknown>;

    if (contentSid) {
      // Send using ContentSid + ContentVariables (works outside 24-hour window)
      const formBody = new URLSearchParams({
        To: whatsappTo,
        From: whatsappFrom,
        ContentSid: contentSid,
        ContentVariables: JSON.stringify({ "1": analysis.message }),
      });

      res = await fetch(twilioMsgUrl, {
        method: "POST",
        headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });
      result = await res.json();

      // If template send fails, try freeform as fallback (within 24h window)
      if (!res.ok) {
        console.log("[WhatsApp] Template send failed, trying freeform:", result);
        const fallbackBody = new URLSearchParams({
          To: whatsappTo,
          From: whatsappFrom,
          Body: analysis.message,
        });
        res = await fetch(twilioMsgUrl, {
          method: "POST",
          headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
          body: fallbackBody.toString(),
        });
        result = await res.json();
      }
    } else {
      // No template available, try freeform (only works within 24h window)
      const formBody = new URLSearchParams({
        To: whatsappTo,
        From: whatsappFrom,
        Body: analysis.message,
      });
      res = await fetch(twilioMsgUrl, {
        method: "POST",
        headers: { Authorization: twilioAuth, "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });
      result = await res.json();
    }

    // Log the message
    await supabase.from("whatsapp_messages").insert({
      user_id: userId,
      call_log_id: callLogId,
      to_number: customerNumber,
      from_number: "+14155238886",
      message_type: contentSid ? "template" : "text",
      content: analysis.message,
      status: res.ok ? "sent" : "failed",
      twilio_message_sid: (result.sid as string) || null,
      metadata: { twilio_status: result.status, ai_generated: true, content_sid: contentSid || null, error: res.ok ? null : result },
    });

    console.log("[WhatsApp Auto] Sent:", { callLogId, to: customerNumber, sid: result.sid, ok: res.ok, template: !!contentSid });
  } catch (err) {
    console.error("[WhatsApp Auto] Failed:", err);
  }
}

/**
 * Sync stale call records whose status is still "initiated" or "ringing" by
 * fetching their latest state from ElevenLabs and persisting updates to the DB.
 * Runs in the background and does not block the response.
 */
async function syncStaleCalls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    const { data: staleCalls } = await supabase
      .from("call_logs")
      .select("id, elevenlabs_conversation_id, status")
      .eq("user_id", userId)
      .in("status", ["initiated", "ringing", "in_progress"])
      .not("elevenlabs_conversation_id", "is", null)
      .limit(10);

    if (!staleCalls || staleCalls.length === 0) return;

    await Promise.allSettled(
      staleCalls.map(async (call) => {
        try {
          const conversation = await getConversation(
            call.elevenlabs_conversation_id!
          );
          const updates: Record<string, unknown> = {};

          // Normalise transcript: ElevenLabs uses "message" + "time_in_call_secs"
          if (conversation.transcript && conversation.transcript.length > 0) {
            updates.transcript = conversation.transcript.map(
              (entry: Record<string, unknown>) => ({
                role: entry.role,
                text: entry.message || entry.text || "",
                timestamp: entry.time_in_call_secs ?? entry.timestamp,
              })
            );
          }

          if (
            conversation.status === "done" ||
            conversation.status === "completed"
          ) {
            updates.status = "completed";
            if (conversation.metadata?.call_duration_secs) {
              updates.duration_seconds = Math.round(
                conversation.metadata.call_duration_secs
              );
            }
            updates.ended_at = new Date().toISOString();

            // Trigger WhatsApp auto-send check in background (fire and forget)
            if (call.status !== "completed") {
              triggerWhatsAppAutoSend(supabase, call.id, userId).catch(() => {});
            }
          } else if (conversation.status === "failed") {
            updates.status = "failed";
          }

          if (conversation.analysis?.call_successful !== undefined) {
            updates.metadata = {
              call_successful: conversation.analysis.call_successful,
              call_summary: conversation.analysis.summary || null,
            };
          }

          if (Object.keys(updates).length > 0) {
            await supabase
              .from("call_logs")
              .update(updates)
              .eq("id", call.id);
          }
        } catch {
          // Silently ignore per-call sync errors
        }
      })
    );
  } catch {
    // Don't let sync errors break the list endpoint
  }
}

/**
 * Sync inbound calls from ElevenLabs that aren't yet in the call_logs table.
 * Fetches recent conversations from ElevenLabs for each deployed agent owned
 * by the user, filters for phone-based inbound calls, and inserts new records.
 */
async function syncInboundCalls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    // Get all agents with ElevenLabs deployment for this user
    const { data: agents } = await supabase
      .from("agents")
      .select("id, elevenlabs_agent_id, name")
      .eq("user_id", userId)
      .not("elevenlabs_agent_id", "is", null);

    if (!agents || agents.length === 0) return;

    // Get user's phone numbers to map elevenlabs IDs to local records
    const { data: phoneNumbers } = await supabase
      .from("phone_numbers")
      .select("id, phone_number, elevenlabs_phone_number_id")
      .eq("user_id", userId);

    const phoneMap = new Map(
      (phoneNumbers || []).map((p) => [p.elevenlabs_phone_number_id, p])
    );

    // Look back 7 days for inbound calls
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

    for (const agent of agents) {
      try {
        const convos = await listConversations({
          agent_id: agent.elevenlabs_agent_id!,
          page_size: 50,
          call_start_after_unix: sevenDaysAgo,
        });

        if (!convos.conversations || convos.conversations.length === 0) continue;

        // Get existing conversation IDs so we skip ones already tracked
        const convoIds = convos.conversations.map(
          (c: { conversation_id: string }) => c.conversation_id
        );
        const { data: existing } = await supabase
          .from("call_logs")
          .select("elevenlabs_conversation_id")
          .in("elevenlabs_conversation_id", convoIds);

        const existingIds = new Set(
          (existing || []).map((e) => e.elevenlabs_conversation_id)
        );

        for (const convo of convos.conversations as Array<{
          conversation_id: string;
          direction?: string;
          status: string;
          start_time_unix_secs?: number;
          call_duration_secs?: number;
          call_successful?: string;
          agent_id: string;
        }>) {
          // Skip if already tracked or not an inbound call
          if (existingIds.has(convo.conversation_id)) continue;
          if (convo.direction !== "inbound") continue;

          // Fetch full conversation detail to get phone numbers
          try {
            const detail = await getConversation(convo.conversation_id);
            const phoneCall = detail.metadata?.phone_call;
            if (!phoneCall) continue; // Not a phone call

            const fromNumber = phoneCall.external_number || null;
            const agentNumber = phoneCall.agent_number || null;
            const phoneNumberId = phoneCall.phone_number_id || null;

            // Map to local phone number record
            const localPhone = phoneNumberId ? phoneMap.get(phoneNumberId) : null;

            const startedAt = convo.start_time_unix_secs
              ? new Date(convo.start_time_unix_secs * 1000).toISOString()
              : new Date().toISOString();

            const callStatus =
              convo.status === "done" || convo.status === "completed"
                ? "completed"
                : convo.status === "failed"
                ? "failed"
                : "in_progress";

            // Normalise transcript
            let transcript = null;
            if (detail.transcript && detail.transcript.length > 0) {
              transcript = detail.transcript.map(
                (entry: Record<string, unknown>) => ({
                  role: entry.role,
                  text: entry.message || entry.text || "",
                  timestamp: entry.time_in_call_secs ?? entry.timestamp,
                })
              );
            }

            await supabase.from("call_logs").insert({
              user_id: userId,
              agent_id: agent.id,
              phone_number_id: localPhone?.id || null,
              direction: "inbound",
              status: callStatus,
              from_number: fromNumber,
              to_number: agentNumber,
              elevenlabs_conversation_id: convo.conversation_id,
              started_at: startedAt,
              ended_at:
                callStatus === "completed" && convo.call_duration_secs
                  ? new Date(
                      (convo.start_time_unix_secs || 0) * 1000 +
                        convo.call_duration_secs * 1000
                    ).toISOString()
                  : null,
              duration_seconds: convo.call_duration_secs || 0,
              transcript,
              metadata: {
                call_successful: convo.call_successful || null,
                call_summary: detail.analysis?.summary || null,
                synced_from_elevenlabs: true,
              },
            });

            console.log("[Sync] Imported inbound call:", {
              conversation_id: convo.conversation_id,
              agent: agent.name,
              from: fromNumber,
            });
          } catch {
            // Skip individual conversation errors
          }
        }
      } catch {
        // Skip per-agent errors
      }
    }
  } catch {
    // Don't let sync errors break the list endpoint
  }
}

/**
 * Check for recently completed calls that don't have WhatsApp messages yet
 * and trigger auto-send for them.
 */
async function checkPendingWhatsApp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  try {
    // Get completed calls from last 24 hours that have transcripts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: completedCalls } = await supabase
      .from("call_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "completed")
      .not("transcript", "is", null)
      .gte("started_at", oneDayAgo)
      .order("started_at", { ascending: false })
      .limit(10);

    if (!completedCalls || completedCalls.length === 0) return;

    // Check which ones already have WhatsApp messages
    const callIds = completedCalls.map((c) => c.id);
    const { data: sentMessages } = await supabase
      .from("whatsapp_messages")
      .select("call_log_id")
      .in("call_log_id", callIds);

    const sentCallIds = new Set((sentMessages || []).map((m) => m.call_log_id));
    const pendingCalls = callIds.filter((id) => !sentCallIds.has(id));

    // Trigger auto-send for first pending call (one at a time to avoid rate limits)
    if (pendingCalls.length > 0) {
      triggerWhatsAppAutoSend(supabase, pendingCalls[0], userId).catch(() => {});
    }
  } catch {
    // Don't let this break the list endpoint
  }
}

// GET /api/calls - List call logs with filters and pagination
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

    // Sync stale outbound calls and import inbound calls from ElevenLabs
    await Promise.allSettled([
      syncStaleCalls(supabase, user.id),
      syncInboundCalls(supabase, user.id),
    ]);

    // Background: check for completed calls that need WhatsApp follow-up
    checkPendingWhatsApp(supabase, user.id).catch(() => {});

    const { searchParams } = new URL(request.url);
    const direction = searchParams.get("direction");
    const status = searchParams.get("status");
    const agentId = searchParams.get("agent_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("call_logs")
      .select(
        "*, agent:agents(id, name, domain), phone_number:phone_numbers(id, phone_number, friendly_name)",
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (direction) query = query.eq("direction", direction);
    if (status) query = query.eq("status", status);
    if (agentId) query = query.eq("agent_id", agentId);
    if (dateFrom) query = query.gte("started_at", dateFrom);
    if (dateTo) query = query.lte("started_at", dateTo);

    query = query.range(offset, offset + limit - 1);

    const { data: calls, count, error } = await query;

    if (error) {
      console.error("Error fetching call logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch call logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      calls: calls || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in GET /api/calls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/calls - Initiate an outbound call
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
    const parsed = outboundCallSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get agent and verify ownership
    const { data: agent } = await supabase
      .from("agents")
      .select("id, elevenlabs_agent_id, name")
      .eq("id", parsed.data.agent_id)
      .eq("user_id", user.id)
      .single();

    if (!agent || !agent.elevenlabs_agent_id) {
      return NextResponse.json(
        { error: "Agent not found or not deployed to ElevenLabs" },
        { status: 404 }
      );
    }

    // Get phone number and verify ownership (include provider info)
    const { data: phoneNumber } = await supabase
      .from("phone_numbers")
      .select("*, telephony_config:telephony_configs(provider)")
      .eq("id", parsed.data.phone_number_id)
      .eq("user_id", user.id)
      .single();

    if (!phoneNumber || !phoneNumber.elevenlabs_phone_number_id) {
      return NextResponse.json(
        { error: "Phone number not found or not imported to ElevenLabs" },
        { status: 404 }
      );
    }

    // Create call log record
    const { data: callLog, error: insertError } = await supabase
      .from("call_logs")
      .insert({
        user_id: user.id,
        agent_id: parsed.data.agent_id,
        phone_number_id: parsed.data.phone_number_id,
        direction: "outbound",
        status: "initiated",
        from_number: phoneNumber.phone_number,
        to_number: parsed.data.to_number,
        metadata: {
          ...(parsed.data.contact_name ? { contact_name: parsed.data.contact_name } : {}),
        },
      })
      .select()
      .single();

    if (insertError || !callLog) {
      console.error("Error creating call log:", insertError);
      return NextResponse.json(
        { error: "Failed to create call record" },
        { status: 500 }
      );
    }

    try {
      // Ensure phone number is assigned to this agent on ElevenLabs
      // This is critical: if the agent was re-deployed, the phone number
      // may still point to the old (deleted) agent ID on ElevenLabs
      try {
        console.log("[Calls] Assigning phone number to agent on ElevenLabs:", {
          phone_number_id: phoneNumber.elevenlabs_phone_number_id,
          agent_id: agent.elevenlabs_agent_id,
        });
        await updateElevenLabsPhoneNumber(
          phoneNumber.elevenlabs_phone_number_id,
          { agent_id: agent.elevenlabs_agent_id }
        );
      } catch (assignErr) {
        console.error("[Calls] Failed to assign phone number to agent (continuing):", assignErr);
      }

      // Make outbound call via ElevenLabs
      const clientData: Record<string, string> = {};
      if (parsed.data.contact_name) clientData.contact_name = parsed.data.contact_name;

      // Determine provider from phone number record
      const provider = phoneNumber.provider
        || (phoneNumber.telephony_config as { provider?: string } | null)?.provider
        || "twilio";

      const callResult = await makeOutboundCall({
        agent_id: agent.elevenlabs_agent_id,
        agent_phone_number_id: phoneNumber.elevenlabs_phone_number_id,
        to_number: parsed.data.to_number,
        provider,
        ...(Object.keys(clientData).length > 0
          ? { conversation_initiation_client_data: clientData }
          : {}),
      });

      console.log("[Calls] Outbound call initiated:", {
        call_log_id: callLog.id,
        conversation_id: callResult.conversation_id || callResult.id,
        callSid: callResult.callSid,
        success: callResult.success,
        message: callResult.message,
      });

      // Update call log with ElevenLabs conversation ID
      await supabase
        .from("call_logs")
        .update({
          elevenlabs_conversation_id: callResult.conversation_id || callResult.id,
          status: "ringing",
        })
        .eq("id", callLog.id);

      return NextResponse.json(
        {
          ...callLog,
          elevenlabs_conversation_id: callResult.conversation_id || callResult.id,
          status: "ringing",
        },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    } catch (callError) {
      // Mark call as failed
      await supabase
        .from("call_logs")
        .update({ status: "failed" })
        .eq("id", callLog.id);

      console.error("[Calls] Outbound call failed:", callError);
      return NextResponse.json(
        {
          error:
            callError instanceof Error
              ? callError.message
              : "Failed to initiate outbound call",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/calls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
