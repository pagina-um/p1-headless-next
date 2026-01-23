import { NextRequest, NextResponse } from "next/server";
import { FEATURES } from "@/config/features";
import { getTTSMetadata } from "@/services/tts-cache";

/**
 * GET /api/tts?postId=123
 * Check if TTS audio is cached for a given post.
 */
export async function GET(request: NextRequest) {
  if (!FEATURES.TTS_ENABLED) {
    return NextResponse.json({ error: "TTS is disabled" }, { status: 403 });
  }

  try {
    const postId = request.nextUrl.searchParams.get("postId");
    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId parameter" },
        { status: 400 }
      );
    }

    const numericId = parseInt(postId, 10);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json(
        { error: "Invalid postId parameter" },
        { status: 400 }
      );
    }
    const metadata = await getTTSMetadata(numericId);
    if (metadata) {
      return NextResponse.json({
        cached: true,
        url: metadata.blobUrl,
        durationSeconds: metadata.durationSeconds,
      });
    }

    return NextResponse.json({ cached: false });
  } catch (error) {
    console.error("TTS GET error:", error);
    return NextResponse.json(
      { error: "Failed to check TTS cache" },
      { status: 500 }
    );
  }
}
