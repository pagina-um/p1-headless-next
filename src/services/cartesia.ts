/**
 * Cartesia TTS API client.
 * Generates MP3 audio from text chunks using the /tts/bytes endpoint.
 */

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY;
const CARTESIA_VOICE_ID = process.env.CARTESIA_VOICE_ID;
const CARTESIA_API_URL = "https://api.cartesia.ai/tts/bytes";

interface CartesiaRequest {
  model_id: string;
  transcript: string;
  voice: {
    mode: "id";
    id: string;
  };
  language: string;
  output_format: {
    container: "mp3";
    bit_rate: number;
    sample_rate: number;
  };
  save: boolean;
}

/**
 * Generate audio for a single text chunk.
 * Returns raw MP3 buffer.
 */
async function generateChunkAudio(text: string): Promise<Buffer> {
  if (!CARTESIA_API_KEY || !CARTESIA_VOICE_ID) {
    throw new Error("Missing Cartesia environment variables");
  }

  const body: CartesiaRequest = {
    model_id: "sonic-3",
    transcript: text,
    voice: {
      mode: "id",
      id: CARTESIA_VOICE_ID,
    },
    language: "pt",
    output_format: {
      container: "mp3",
      bit_rate: 128000,
      sample_rate: 44100,
    },
    save: false,
  };

  let lastError: Error | null = null;

  // Retry up to 3 times with backoff for rate limits
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(CARTESIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CARTESIA_API_KEY}`,
        "Cartesia-Version": "2024-06-10",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    if (response.status === 429) {
      // Rate limited - wait with exponential backoff
      const waitMs = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      lastError = new Error(`Rate limited (attempt ${attempt + 1})`);
      continue;
    }

    const errorText = await response.text();
    throw new Error(
      `Cartesia API error ${response.status}: ${errorText}`
    );
  }

  throw lastError || new Error("Failed after retries");
}

/**
 * Generate full article audio by processing chunks sequentially.
 * Returns concatenated MP3 buffer.
 */
export async function generateFullArticleAudio(
  chunks: string[]
): Promise<Buffer> {
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const audioBuffer = await generateChunkAudio(chunk);
    buffers.push(audioBuffer);
  }

  return Buffer.concat(buffers);
}

/**
 * Estimate audio duration from MP3 buffer size.
 * At 128kbps: duration = bytes * 8 / 128000
 */
export function estimateDuration(buffer: Buffer): number {
  return Math.round((buffer.length * 8) / 128000);
}
