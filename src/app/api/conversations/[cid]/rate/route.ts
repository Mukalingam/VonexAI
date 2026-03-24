import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message_id, rating } = await request.json();

    if (!message_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Valid message_id and rating (1-5) required" },
        { status: 400 }
      );
    }

    // Verify the conversation belongs to the current user
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", cid)
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify the message belongs to this conversation
    const { error } = await supabase
      .from("messages")
      .update({ rating })
      .eq("id", message_id)
      .eq("conversation_id", cid);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update rating" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
