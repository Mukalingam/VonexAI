import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        status,
        total_turns,
        total_tokens,
        started_at,
        ended_at,
        messages (
          id,
          role,
          content,
          created_at
        )
      `
      )
      .eq("agent_id", id)
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    // Build a summary for each conversation (first user message as preview)
    const summaries = (conversations || []).map((conv) => {
      const messages = (conv.messages as any[]) || [];
      const sorted = messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const firstUserMsg = sorted.find((m) => m.role === "user");
      return {
        id: conv.id,
        status: conv.status,
        total_turns: conv.total_turns,
        started_at: conv.started_at,
        ended_at: conv.ended_at,
        preview: firstUserMsg
          ? firstUserMsg.content.slice(0, 80)
          : "No messages yet",
        message_count: messages.length,
      };
    });

    return NextResponse.json(summaries);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
