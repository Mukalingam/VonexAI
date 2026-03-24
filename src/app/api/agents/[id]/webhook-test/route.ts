import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/agents/[id]/webhook-test - Test webhook URL server-side (avoids CORS)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify agent ownership
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { webhook_url } = await request.json();

    if (!webhook_url || typeof webhook_url !== "string") {
      return NextResponse.json(
        { error: "webhook_url is required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      const url = new URL(webhook_url);
      if (!["http:", "https:"].includes(url.protocol)) {
        return NextResponse.json(
          { error: "Only http/https URLs allowed" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Send test webhook server-side
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "test",
          agent_id: agentId,
          timestamp: new Date().toISOString(),
          data: {
            message: "This is a test webhook from Vonex AI.",
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      return NextResponse.json({
        success: res.ok,
        status: res.status,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      return NextResponse.json({
        success: false,
        error: fetchError instanceof Error ? fetchError.message : "Request failed",
      });
    }
  } catch (error) {
    console.error("Webhook test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
