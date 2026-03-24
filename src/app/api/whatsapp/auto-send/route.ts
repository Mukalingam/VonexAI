import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface TranscriptMessage {
  role: string;
  text: string;
  timestamp?: number;
}

// POST /api/whatsapp/auto-send - Analyze completed call and auto-send WhatsApp if promised
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { call_log_id } = await request.json();
    if (!call_log_id) {
      return NextResponse.json({ error: "call_log_id is required" }, { status: 400 });
    }

    // Get the call with transcript
    const { data: call } = await supabase
      .from("call_logs")
      .select("id, transcript, to_number, from_number, direction, metadata, agent_id, agents(name, system_prompt)")
      .eq("id", call_log_id)
      .eq("user_id", user.id)
      .single();

    if (!call || !call.transcript) {
      return NextResponse.json({ error: "Call not found or no transcript" }, { status: 404 });
    }

    // Check if WhatsApp message already sent for this call
    const { data: existing } = await supabase
      .from("whatsapp_messages")
      .select("id")
      .eq("call_log_id", call_log_id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: "WhatsApp already sent for this call", skipped: true });
    }

    const transcript = call.transcript as TranscriptMessage[];
    const conversationText = transcript
      .map((m) => `${m.role === "agent" ? "Agent" : "Customer"}: ${m.text}`)
      .join("\n");

    // Use Claude to determine if agent promised to send info on WhatsApp
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Analyze this phone call transcript and determine if the AI agent promised to send any information over WhatsApp or text message to the customer.

Transcript:
${conversationText}

Respond ONLY with JSON (no markdown):
{
  "should_send_whatsapp": true/false,
  "message_content": "The actual message to send (include relevant details from the conversation like pricing, booking confirmation, property details, etc.)",
  "reason": "Why the message should or shouldn't be sent"
}

If the agent promised to send details, pricing, brochure info, booking confirmation, or any information via WhatsApp/text, set should_send_whatsapp to true and compose a professional, concise WhatsApp message with the relevant information.`,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ message: "Could not analyze transcript" });
    }

    let analysis: { should_send_whatsapp: boolean; message_content: string; reason: string };
    try {
      analysis = JSON.parse(textContent.text);
    } catch {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return NextResponse.json({ message: "Could not parse analysis" });
      analysis = JSON.parse(jsonMatch[0]);
    }

    if (!analysis.should_send_whatsapp) {
      return NextResponse.json({
        message: "No WhatsApp message needed",
        reason: analysis.reason,
        should_send: false,
      });
    }

    // Determine the customer's phone number
    const customerNumber = call.direction === "outbound" ? call.to_number : call.from_number;
    if (!customerNumber) {
      return NextResponse.json({ error: "No customer phone number available" }, { status: 400 });
    }

    // Send the WhatsApp message
    const sendRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        to_number: customerNumber,
        message: analysis.message_content,
        call_log_id,
      }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.json();
      return NextResponse.json({ error: err.error || "Failed to send WhatsApp" }, { status: 502 });
    }

    const sendResult = await sendRes.json();

    return NextResponse.json({
      success: true,
      message: "WhatsApp sent automatically",
      message_sid: sendResult.message_sid,
      content: analysis.message_content,
      reason: analysis.reason,
    });
  } catch (error) {
    console.error("Error in POST /api/whatsapp/auto-send:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
