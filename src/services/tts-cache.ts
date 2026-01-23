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
 * Acquire a global TTS batch lock (SET NX with 600s TTL).
 * Prevents overlapping batch runs so only one workflow hits Cartesia at a time.
 * TTL is a safety net — workflow clears the lock when done.
 */
export async function acquireTTSBatchLock(): Promise<boolean> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/set/tts:batch_running/1/EX/600/NX`,
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

  const data = await response.json();
  return data.result !== null;
}

/**
 * Clear the global TTS batch lock.
 */
export async function clearTTSBatchLock(): Promise<void> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/del/tts:batch_running`,
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
 * Set a TTS error for a post (5-min TTL so the UI can show failure state).
 */
export async function setTTSError(postId: number, message: string): Promise<void> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const truncated = message.slice(0, 200);

  const response = await fetch(
    `${KV_REST_API_URL}/pipeline`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
      body: JSON.stringify([
        ["SET", `tts:error:${postId}`, truncated, "EX", 300],
      ]),
    }
  );

  if (!response.ok) {
    throw new Error(`KV Store responded with status: ${response.status}`);
  }
}

/**
 * Get TTS error message for a post (if any).
 */
export async function getTTSError(postId: number): Promise<string | null> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error("Missing KV Store environment variables");
  }

  const response = await fetch(
    `${KV_REST_API_URL}/get/tts:error:${postId}`,
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
  return data.result || null;
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
