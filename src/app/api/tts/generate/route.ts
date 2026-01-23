import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getTTSMetadata, saveTTSMetadata, setTTSError } from "@/services/tts-cache";
import { generateFullArticleAudio, estimateDuration } from "@/services/cartesia";
import { htmlToTtsText } from "@/utils/htmlToText";
import { chunkTextForTTS } from "@/utils/ttsChunker";
import { GET_POST_BY_ID, getClient } from "@/services/wp-graphql";

export const maxDuration = 120;

/**
 * POST /api/tts/generate
 * Internal endpoint called by the TTS workflow to generate audio for a single article.
 * Body: { postId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    // Skip if already generated
    const existing = await getTTSMetadata(postId);
    if (existing) {
      return NextResponse.json({ status: "already_cached" });
    }

    // Fetch article
    const { data, error } = await getClient().query(GET_POST_BY_ID, { id: String(postId) });
    if (error || !data?.post?.content) {
      const msg = `Could not fetch post by ID ${postId}`;
      await setTTSError(postId, msg).catch(() => {});
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    const title = data.post.title || "";
    const content = data.post.content;

    // Convert and chunk
    const plainText = htmlToTtsText(content, title);
    const chunks = chunkTextForTTS(plainText);
    if (chunks.length === 0) {
      return NextResponse.json({ error: "No text to generate" }, { status: 400 });
    }

    // Generate audio via Cartesia (sequential chunks with built-in retries)
    const audioBuffer = await generateFullArticleAudio(chunks);
    const durationSeconds = estimateDuration(audioBuffer);
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

    return NextResponse.json({ status: "generated", blobUrl: blob.url });
  } catch (error) {
    const postId = await request.clone().json().then(b => b.postId).catch(() => null);
    const message = error instanceof Error ? error.message : "TTS generation failed";
    console.error(`TTS generate failed for post ${postId}:`, error);
    if (postId) {
      await setTTSError(postId, message).catch(() => {});
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
