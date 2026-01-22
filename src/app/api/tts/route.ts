import { NextRequest, NextResponse } from "next/server";
import { FEATURES } from "@/config/features";
import { put } from "@vercel/blob";
import { loadGridStateRedis } from "@/services/redis";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { getTTSMetadata, saveTTSMetadata } from "@/services/tts-cache";
import { generateFullArticleAudio, estimateDuration } from "@/services/cartesia";
import { htmlToTtsText } from "@/utils/htmlToText";
import { chunkTextForTTS } from "@/utils/ttsChunker";
import { GET_POST_BY_SLUG, getClient } from "@/services/wp-graphql";

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

    const metadata = await getTTSMetadata(parseInt(postId, 10));
    if (!metadata) {
      return NextResponse.json({ cached: false }, { status: 404 });
    }

    return NextResponse.json({
      cached: true,
      url: metadata.blobUrl,
      durationSeconds: metadata.durationSeconds,
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
 * Generate TTS audio for an article.
 * Body: { postId: number, slug: string }
 */
export async function POST(request: NextRequest) {
  if (!FEATURES.TTS_ENABLED) {
    return NextResponse.json({ error: "TTS is disabled" }, { status: 403 });
  }

  try {
    const { postId, slug } = await request.json();

    if (!postId || !slug) {
      return NextResponse.json(
        { error: "Missing postId or slug" },
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

    // Verify article is in top 10 grid positions
    const gridState = await loadGridStateRedis();
    if (!gridState) {
      return NextResponse.json(
        { error: "Grid state not available" },
        { status: 500 }
      );
    }

    const sorted = sortBlocksZigzagThenMobilePriority(gridState.blocks);
    const top10Ids = sorted
      .filter((b) => b.blockType === "story")
      .slice(0, 10)
      .map((b) => (b as { databaseId: number }).databaseId);

    if (!top10Ids.includes(postId)) {
      return NextResponse.json(
        { error: "Article not eligible for TTS" },
        { status: 403 }
      );
    }

    // Fetch article content
    const { data, error } = await getClient().query(GET_POST_BY_SLUG, {
      slug,
    });

    if (error || !data?.postBy?.content) {
      return NextResponse.json(
        { error: "Failed to fetch article content" },
        { status: 500 }
      );
    }

    const title = data.postBy.title || "";
    const content = data.postBy.content;

    // Convert HTML to plain text
    const plainText = htmlToTtsText(content, title);

    // Chunk text for TTS
    const chunks = chunkTextForTTS(plainText);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No text content to convert" },
        { status: 400 }
      );
    }

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
    const metadata = {
      postId,
      blobUrl: blob.url,
      generatedAt: new Date().toISOString(),
      contentHash,
      durationSeconds,
      chunkCount: chunks.length,
    };

    await saveTTSMetadata(metadata);

    return NextResponse.json({
      url: blob.url,
      durationSeconds,
      cached: false,
    });
  } catch (error) {
    console.error("TTS POST error:", error);
    return NextResponse.json(
      { error: "Failed to generate TTS audio" },
      { status: 500 }
    );
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
