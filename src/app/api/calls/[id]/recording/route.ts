import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConversationAudio } from "@/lib/elevenlabs";

// GET /api/calls/[id]/recording - Proxy recording audio from ElevenLabs
export async function GET(
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

    const { data: callLog } = await supabase
      .from("call_logs")
      .select("elevenlabs_conversation_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!callLog?.elevenlabs_conversation_id) {
      return NextResponse.json(
        { error: "Recording not available" },
        { status: 404 }
      );
    }

    const audioResponse = await getConversationAudio(
      callLog.elevenlabs_conversation_id
    );

    if (!audioResponse.body) {
      return NextResponse.json(
        { error: "Recording not available" },
        { status: 404 }
      );
    }

    // Buffer the entire audio so we can set Content-Length
    // This allows the browser's audio element to know the duration
    const arrayBuffer = await audioResponse.arrayBuffer();
    const contentType =
      audioResponse.headers.get("content-type") || "audio/mpeg";

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/calls/[id]/recording:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
