import { NextRequest, NextResponse } from "next/server";
import { clearTTSBatchLock } from "@/services/tts-cache";

/**
 * POST /api/tts/batch-complete
 * Internal endpoint called by the TTS workflow when the batch finishes.
 * Clears the global batch lock so future grid saves can trigger new batches.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-internal-secret");
  if (!process.env.TTS_INTERNAL_SECRET || secret !== process.env.TTS_INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await clearTTSBatchLock();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Failed to clear TTS batch lock:", error);
    return NextResponse.json({ error: "Failed to clear lock" }, { status: 500 });
  }
}
