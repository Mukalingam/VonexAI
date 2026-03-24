import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/telephony/config/[id] - Remove telephony configuration
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check no phone numbers are using this config
    const { data: numbers } = await supabase
      .from("phone_numbers")
      .select("id")
      .or(`telephony_config_id.eq.${id},twilio_config_id.eq.${id}`)
      .eq("user_id", user.id)
      .limit(1);

    if (numbers && numbers.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete: phone numbers are still using this account. Remove them first." },
        { status: 409 }
      );
    }

    // Delete from both tables
    await Promise.all([
      supabase.from("telephony_configs").delete().eq("id", id).eq("user_id", user.id),
      supabase.from("twilio_configs").delete().eq("id", id).eq("user_id", user.id),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/telephony/config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
