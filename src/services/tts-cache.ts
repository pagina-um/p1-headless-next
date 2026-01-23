/**
 * TTS cache service using Upstash KV REST API.
 * Stores metadata about generated TTS audio files.
 */

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

export interface TTSMetadata {
  postId: number;
  blobUrl: string;
  generatedAt: string;
  contentHash: string;
  durationSeconds: number;
  chunkCount: number;
}

function getTTSKey(postId: number): string {
  return `tts:${postId}`;
}

/**
 * Get TTS metadata for a post from Redis.
 */
export async function getTTSMetadata(
  postId: number
): Promise<TTSMetadata | null> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/get/${getTTSKey(postId)}`,
    {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`KV Store responded with status: ${response.status}`);
  }

  const responseData = await response.json();

  if (!responseData.result) {
    return null;
  }

  const metadata =
    typeof responseData.result === "string"
      ? JSON.parse(responseData.result)
      : responseData.result;

  return metadata as TTSMetadata;
}

/**
 * Save TTS metadata to Redis.
 */
export async function saveTTSMetadata(metadata: TTSMetadata): Promise<void> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/set/${getTTSKey(metadata.postId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) {
    throw new Error(`KV Store responded with status: ${response.status}`);
  }
}

/**
 * Mark a post as currently generating TTS (with 120s TTL as safety net).
 */
export async function setTTSGenerating(postId: number): Promise<void> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/set/tts:generating:${postId}/1/EX/120`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`KV Store responded with status: ${response.status}`);
  }
}

/**
 * Check if a post is currently generating TTS.
 */
export async function isTTSGenerating(postId: number): Promise<boolean> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/get/tts:generating:${postId}`,
    {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`KV Store responded with status: ${response.status}`);
  }

  const data = await response.json();
  return !!data.result;
}

/**
 * Clear the generating flag for a post.
 */
export async function clearTTSGenerating(postId: number): Promise<void> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/del/tts:generating:${postId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`KV Store responded with status: ${response.status}`);
  }
}

/**
 * Delete TTS metadata from Redis.
 */
export async function deleteTTSMetadata(postId: number): Promise<void> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/del/${getTTSKey(postId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`KV Store responded with status: ${response.status}`);
  }
}
