import { NextRequest, NextResponse } from "next/server";
import { FEATURES } from "@/config/features";
import { put } from "@vercel/blob";
import { loadGridStateRedis } from "@/services/redis";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { getTTSMetadata, saveTTSMetadata, acquireTTSGeneratingLock, isTTSGenerating, clearTTSGenerating } from "@/services/tts-cache";
import { generateFullArticleAudio, estimateDuration } from "@/services/cartesia";
import { htmlToTtsText } from "@/utils/htmlToText";
import { chunkTextForTTS } from "@/utils/ttsChunker";
import { GET_POST_BY_SLUG, GET_POST_BY_ID, getClient } from "@/services/wp-graphql";
import { waitUntil } from "@vercel/functions";

export const maxDuration = 60;

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
    const metadata = await getTTSMetadata(numericId);
    if (metadata) {
      return NextResponse.json({
        cached: true,
        eligible: true,
        url: metadata.blobUrl,
        durationSeconds: metadata.durationSeconds,
      });
    }

    // Not cached — check eligibility
    const gridState = await loadGridStateRedis();
    if (!gridState) {
      return NextResponse.json({ cached: false, eligible: false });
    }

    const sorted = sortBlocksZigzagThenMobilePriority(gridState.blocks);
    const top10Ids = sorted
      .filter((b) => b.blockType === "story")
      .slice(0, 10)
      .map((b) => (b as { databaseId: number }).databaseId);

    const eligible = top10Ids.includes(numericId);
    const generating = eligible ? await isTTSGenerating(numericId) : false;

    return NextResponse.json({
      cached: false,
      eligible,
      generating,
    });
  } catch (error) {
    console.error("TTS GET error:", error);
    return NextResponse.json(
      { error: "Failed to check TTS cache" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tts
 * Trigger TTS audio generation for an article.
 * Returns immediately; generation runs in the background.
 * Body: { postId: number, slug?: string }
 */
export async function POST(request: NextRequest) {
  if (!FEATURES.TTS_ENABLED) {
    return NextResponse.json({ error: "TTS is disabled" }, { status: 403 });
  }

  try {
    const { postId, slug } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    // Check cache first
    const existing = await getTTSMetadata(postId);
    if (existing) {
      return NextResponse.json({
        url: existing.blobUrl,
        durationSeconds: existing.durationSeconds,
        cached: true,
      });
    }

    // Acquire lock — if already generating, just report status
    const acquired = await acquireTTSGeneratingLock(postId);
    if (!acquired) {
      return NextResponse.json({ status: "generating" });
    }

    waitUntil(generateAndCacheTTS(postId, slug));

    return NextResponse.json({ status: "generating" });
  } catch (error) {
    console.error("TTS POST error:", error);
    return NextResponse.json(
      { error: "Failed to generate TTS audio" },
      { status: 500 }
    );
  }
}

async function generateAndCacheTTS(postId: number, slug?: string) {
  try {
    // Re-check cache (another request may have completed generation)
    const existing = await getTTSMetadata(postId);
    if (existing) {
      await clearTTSGenerating(postId);
      return;
    }

    // Fetch article content by slug or by ID
    let title: string;
    let content: string;

    if (slug) {
      const { data, error } = await getClient().query(GET_POST_BY_SLUG, {
        slug,
      });
      if (error || !data?.postBy?.content) {
        console.error(`TTS generation failed: could not fetch post by slug "${slug}"`);
        return;
      }
      title = data.postBy.title || "";
      content = data.postBy.content;
    } else {
      const { data, error } = await getClient().query(GET_POST_BY_ID, {
        id: String(postId),
      });
      if (error || !data?.post?.content) {
        console.error(`TTS generation failed: could not fetch post by ID ${postId}`);
        return;
      }
      title = data.post.title || "";
      content = data.post.content;
    }

    // Convert HTML to plain text
    const plainText = htmlToTtsText(content, title);

    // Chunk text for TTS
    const chunks = chunkTextForTTS(plainText);
    if (chunks.length === 0) return;

    // Generate audio via Cartesia
    const audioBuffer = await generateFullArticleAudio(chunks);
    const durationSeconds = estimateDuration(audioBuffer);

    // Generate content hash for cache invalidation
    const contentHash = simpleHash(plainText);

    // Upload to Vercel Blob
    const blob = await put(`tts/${postId}-${contentHash}.mp3`, audioBuffer, {
      access: "public",
      contentType: "audio/mpeg",
    });

    // Save metadata to Redis
    await saveTTSMetadata({
      postId,
      blobUrl: blob.url,
      generatedAt: new Date().toISOString(),
      contentHash,
      durationSeconds,
      chunkCount: chunks.length,
    });
    await clearTTSGenerating(postId);
  } catch (error) {
    console.error(`TTS background generation failed for post ${postId}:`, error);
    await clearTTSGenerating(postId).catch(() => {});
  }
}

/**
 * Simple hash function for content fingerprinting.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
