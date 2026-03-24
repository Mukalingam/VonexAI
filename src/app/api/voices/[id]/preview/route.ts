import { NextRequest, NextResponse } from "next/server";
import { getVoicePreview } from "@/lib/elevenlabs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: voiceId } = await params;
    const audioBuffer = await getVoicePreview(voiceId);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Voice preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate voice preview" },
      { status: 500 }
    );
  }
}
