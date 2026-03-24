import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { makeOutboundCall } from "@/lib/elevenlabs";

// POST /api/campaigns/[id]/launch - Launch a campaign
export async function POST(
  request: NextRequest,
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

    // Fetch campaign with related data
    const { data: campaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("*, agent:agents(id, elevenlabs_agent_id, name), phone_number:phone_numbers(id, elevenlabs_phone_number_id, phone_number)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "draft" && campaign.status !== "paused") {
      return NextResponse.json(
        { error: `Campaign cannot be launched from "${campaign.status}" status` },
        { status: 400 }
      );
    }

    // Verify agent is deployed
    const agent = campaign.agent as { id: string; elevenlabs_agent_id: string | null; name: string } | null;
    if (!agent?.elevenlabs_agent_id) {
      return NextResponse.json(
        { error: "Agent is not deployed to ElevenLabs" },
        { status: 400 }
      );
    }

    // Verify phone number is imported
    const phoneNumber = campaign.phone_number as { id: string; elevenlabs_phone_number_id: string | null; phone_number: string } | null;
    if (!phoneNumber?.elevenlabs_phone_number_id) {
      return NextResponse.json(
        { error: "Phone number is not configured in ElevenLabs" },
        { status: 400 }
      );
    }

    // Mark campaign as active
    await supabase
      .from("campaigns")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", id);

    // Get pending calls
    const { data: pendingCalls, error: callsError } = await supabase
      .from("campaign_calls")
      .select("*")
      .eq("campaign_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (callsError || !pendingCalls?.length) {
      await supabase
        .from("campaigns")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", id);
      return NextResponse.json({
        message: "No pending contacts to call",
        campaign_id: id,
      });
    }

    let completedCount = campaign.completed_calls || 0;
    let successCount = campaign.successful_calls || 0;
    let failedCount = campaign.failed_calls || 0;

    // Process each pending call sequentially
    for (const campaignCall of pendingCalls) {
      // Check if campaign was paused (re-fetch status)
      const { data: currentCampaign } = await supabase
        .from("campaigns")
        .select("status")
        .eq("id", id)
        .single();

      if (currentCampaign?.status === "paused") {
        break;
      }

      try {
        // Mark call as in-progress
        await supabase
          .from("campaign_calls")
          .update({ status: "calling", last_attempt_at: new Date().toISOString(), attempts: campaignCall.attempts + 1 })
          .eq("id", campaignCall.id);

        // Create call log
        const { data: callLog, error: logError } = await supabase
          .from("call_logs")
          .insert({
            user_id: user.id,
            agent_id: campaign.agent_id,
            phone_number_id: campaign.phone_number_id,
            direction: "outbound",
            status: "initiated",
            to_number: campaignCall.contact_phone,
            from_number: phoneNumber.phone_number,
            metadata: {
              campaign_id: id,
              campaign_call_id: campaignCall.id,
              contact_name: campaignCall.contact_name,
            },
          })
          .select()
          .single();

        if (logError || !callLog) {
          throw new Error("Failed to create call log");
        }

        // Build conversation data with contact name + any custom variables
        const clientData: Record<string, string> = {
          ...(campaignCall.contact_name ? { contact_name: campaignCall.contact_name } : {}),
          ...(campaignCall.contact_variables || {}),
        };

        // Make the outbound call via ElevenLabs
        const callResult = await makeOutboundCall({
          agent_id: agent.elevenlabs_agent_id!,
          agent_phone_number_id: phoneNumber.elevenlabs_phone_number_id!,
          to_number: campaignCall.contact_phone,
          ...(Object.keys(clientData).length > 0
            ? { conversation_initiation_client_data: clientData }
            : {}),
        });

        // Update call log with conversation ID
        await supabase
          .from("call_logs")
          .update({
            elevenlabs_conversation_id: callResult.conversation_id,
            status: "ringing",
          })
          .eq("id", callLog.id);

        // Mark campaign call as completed
        await supabase
          .from("campaign_calls")
          .update({
            status: "completed",
            call_log_id: callLog.id,
            outcome: "connected",
          })
          .eq("id", campaignCall.id);

        completedCount++;
        successCount++;
      } catch (callError) {
        console.error(`Campaign call failed for ${campaignCall.contact_phone}:`, callError);

        // Mark campaign call as failed
        await supabase
          .from("campaign_calls")
          .update({
            status: "failed",
            outcome: callError instanceof Error ? callError.message : "Call failed",
          })
          .eq("id", campaignCall.id);

        completedCount++;
        failedCount++;
      }

      // Update campaign stats after each call
      await supabase
        .from("campaigns")
        .update({
          completed_calls: completedCount,
          successful_calls: successCount,
          failed_calls: failedCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    // Re-check current status (might be paused)
    const { data: finalCampaign } = await supabase
      .from("campaigns")
      .select("status")
      .eq("id", id)
      .single();

    // Mark as completed if still active
    if (finalCampaign?.status === "active") {
      await supabase
        .from("campaigns")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({
      message: "Campaign execution finished",
      campaign_id: id,
      stats: {
        completed: completedCount,
        successful: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/campaigns/[id]/launch:", error);

    // Try to mark campaign as failed
    try {
      const { id } = await params;
      const supabase = await createClient();
      await supabase
        .from("campaigns")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // Ignore cleanup errors
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to launch campaign";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
