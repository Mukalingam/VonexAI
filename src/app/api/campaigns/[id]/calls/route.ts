import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/campaigns/[id]/calls - List campaign calls
export async function GET(
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

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("campaign_calls")
      .select("*", { count: "exact" })
      .eq("campaign_id", id)
      .order("created_at", { ascending: true });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: calls, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching campaign calls:", error);
      return NextResponse.json({ error: "Failed to fetch campaign calls" }, { status: 500 });
    }

    return NextResponse.json({
      calls: calls || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in GET /api/campaigns/[id]/calls:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
