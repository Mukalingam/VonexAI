import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/twilio/config/[id] - Update Twilio configuration
export async function PATCH(
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

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.friendly_name === "string") {
      updates.friendly_name = body.friendly_name;
    }
    if (typeof body.is_active === "boolean") {
      updates.is_active = body.is_active;
    }
    if (typeof body.auth_token === "string" && body.auth_token.length === 32) {
      updates.auth_token = body.auth_token;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: config, error } = await supabase
      .from("twilio_configs")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, user_id, account_sid, friendly_name, is_active, created_at, updated_at")
      .single();

    if (error || !config) {
      return NextResponse.json(
        { error: "Twilio configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error in PATCH /api/twilio/config/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/twilio/config/[id] - Remove Twilio configuration
export async function DELETE(
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

    // Check if any phone numbers are using this config
    const { count } = await supabase
      .from("phone_numbers")
      .select("*", { count: "exact", head: true })
      .eq("twilio_config_id", id)
      .eq("user_id", user.id);

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${count} phone number(s) are using this Twilio configuration. Remove them first.`,
        },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("twilio_configs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting Twilio config:", error);
      return NextResponse.json(
        { error: "Failed to delete Twilio configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/twilio/config/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
