import { put } from "@vercel/blob";
import { getTTSMetadata, saveTTSMetadata, clearTTSBatchLock, setTTSError } from "@/services/tts-cache";
import { generateFullArticleAudio, estimateDuration } from "@/services/cartesia";
import { htmlToTtsText } from "@/utils/htmlToText";
import { chunkTextForTTS } from "@/utils/ttsChunker";
import { GET_POST_BY_ID, getClient } from "@/services/wp-graphql";

interface ArticleData {
  title: string;
  content: string;
}

interface UploadResult {
  blobUrl: string;
  durationSeconds: number;
  contentHash: string;
  chunkCount: number;
}

async function fetchArticle(postId: number): Promise<ArticleData | null> {
  // Skip if already generated (another run may have completed it)
  const existing = await getTTSMetadata(postId);
  if (existing) return null;

  const { data, error } = await getClient().query(GET_POST_BY_ID, { id: String(postId) });
  if (error || !data?.post?.content) {
    throw new Error(`Could not fetch post by ID ${postId}`);
  }
  return { title: data.post.title || "", content: data.post.content };
}

async function generateAndUpload(postId: number, article: ArticleData): Promise<UploadResult> {
  const plainText = htmlToTtsText(article.content, article.title);
  const chunks = chunkTextForTTS(plainText);

  if (chunks.length === 0) {
    throw new Error("No text chunks to generate audio for");
  }

  const audioBuffer = await generateFullArticleAudio(chunks);
  const durationSeconds = estimateDuration(audioBuffer);
  const contentHash = simpleHash(plainText);

  const blob = await put(`tts/${postId}-${contentHash}.mp3`, audioBuffer, {
    access: "public",
    contentType: "audio/mpeg",
  });

  return {
    blobUrl: blob.url,
    durationSeconds,
    contentHash,
    chunkCount: chunks.length,
  };
}

async function saveMetadata(postId: number, result: UploadResult): Promise<void> {
  await saveTTSMetadata({
    postId,
    blobUrl: result.blobUrl,
    generatedAt: new Date().toISOString(),
    contentHash: result.contentHash,
    durationSeconds: result.durationSeconds,
    chunkCount: result.chunkCount,
  });
}

/**
 * TTS batch workflow.
 * Processes a list of articles sequentially — at most 1 Cartesia API call at a time.
 * Clears the global batch lock when done.
 */
export async function ttsBatchWorkflow(postIds: number[]): Promise<void> {
  try {
    for (const postId of postIds) {
      try {
        const article = await fetchArticle(postId);
        if (!article) continue; // already cached, skip

        const result = await generateAndUpload(postId, article);
        await saveMetadata(postId, result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "TTS generation failed";
        console.error(`TTS workflow failed for post ${postId}:`, error);
        await setTTSError(postId, message).catch(() => {});
        // Continue with next article rather than aborting the batch
      }
    }
  } finally {
    await clearTTSBatchLock().catch(() => {});
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
