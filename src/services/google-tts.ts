/**
 * Google Cloud TTS API client.
 * Generates MP3 audio from text chunks using the REST API.
 */

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_API_URL =
  "https://texttospeech.googleapis.com/v1/text:synthesize";

interface GoogleTTSRequest {
  input: { text: string };
  voice: {
    languageCode: string;
    name: string;
  };
  audioConfig: {
    audioEncoding: "MP3";
    sampleRateHertz: number;
  };
}

interface GoogleTTSResponse {
  audioContent: string; // base64-encoded audio
}

/**
 * Generate audio for a single text chunk.
 * Returns raw MP3 buffer.
 */
async function generateChunkAudio(text: string): Promise<Buffer> {
  if (!GOOGLE_TTS_API_KEY) {
    throw new Error("Missing GOOGLE_TTS_API_KEY environment variable");
  }

  const body: GoogleTTSRequest = {
    input: { text },
    voice: {
      languageCode: "pt-PT",
      name: "pt-PT-Neural2-A",
    },
    audioConfig: {
      audioEncoding: "MP3",
      sampleRateHertz: 44100,
    },
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(
      `${GOOGLE_TTS_API_URL}?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      const data: GoogleTTSResponse = await response.json();
      return Buffer.from(data.audioContent, "base64");
    }

    if (response.status === 429) {
      const waitMs = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      lastError = new Error(`Rate limited (attempt ${attempt + 1})`);
      continue;
    }

    const errorText = await response.text();
    throw new Error(
      `Google TTS API error ${response.status}: ${errorText}`
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
 * Google TTS default MP3 is ~32kbps for neural voices, but with
 * 44100Hz sample rate it's typically ~128kbps. Use same formula as Cartesia.
 */
export function estimateDuration(buffer: Buffer): number {
  return Math.round((buffer.length * 8) / 128000);
}
