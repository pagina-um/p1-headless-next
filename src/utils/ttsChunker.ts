/**
 * Splits long text into chunks suitable for TTS API calls.
 * Max chunk size: 4500 characters (safe margin for Cartesia's limit).
 * Splits on sentence boundaries, never breaking mid-sentence.
 */

const MAX_CHUNK_SIZE = 4500;

/**
 * Split text into chunks for TTS processing.
 * Respects sentence boundaries.
 */
export function chunkTextForTTS(text: string): string[] {
  // Split into sentences
  const sentences = splitIntoSentences(text);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    // If a single sentence exceeds max, split it on clause boundaries
    if (sentence.length > MAX_CHUNK_SIZE) {
      // Flush current chunk first
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      // Split oversized sentence on clause boundaries
      const subChunks = splitOnClauseBoundaries(sentence);
      chunks.push(...subChunks);
      continue;
    }

    // Check if adding this sentence would exceed the limit
    const prospective = currentChunk
      ? currentChunk + " " + sentence
      : sentence;

    if (prospective.length > MAX_CHUNK_SIZE) {
      // Flush current chunk and start new one
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk = prospective;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Split text into sentences using common sentence-ending punctuation.
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace or end of string
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.filter((s) => s.trim().length > 0);
}

/**
 * Split an oversized sentence on clause boundaries (commas, semicolons, colons).
 * Each resulting chunk will be under MAX_CHUNK_SIZE.
 */
function splitOnClauseBoundaries(sentence: string): string[] {
  const clauses = sentence.split(/(?<=[,;:])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const clause of clauses) {
    if (clause.length > MAX_CHUNK_SIZE) {
      // Last resort: hard split by character count
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      for (let i = 0; i < clause.length; i += MAX_CHUNK_SIZE) {
        chunks.push(clause.slice(i, i + MAX_CHUNK_SIZE));
      }
      continue;
    }

    const prospective = currentChunk
      ? currentChunk + " " + clause
      : clause;

    if (prospective.length > MAX_CHUNK_SIZE) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = clause;
    } else {
      currentChunk = prospective;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
