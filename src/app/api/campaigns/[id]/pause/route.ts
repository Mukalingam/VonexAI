import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/campaigns/[id]/pause - Pause a campaign
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

    const { data: campaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("id, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "active") {
      return NextResponse.json(
        { error: "Only active campaigns can be paused" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("campaigns")
      .update({ status: "paused", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error pausing campaign:", updateError);
      return NextResponse.json({ error: "Failed to pause campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign: updated, message: "Campaign paused" });
  } catch (error) {
    console.error("Error in POST /api/campaigns/[id]/pause:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
