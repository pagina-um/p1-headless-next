"use workflow";

import { fetch } from "workflow";

/**
 * TTS batch workflow.
 * Processes a list of articles sequentially via HTTP calls to the generate endpoint.
 * Ensures at most 1 Cartesia API call at a time.
 * Clears the global batch lock when done.
 */
export async function ttsBatchWorkflow(baseUrl: string, postIds: number[]): Promise<void> {
  for (const postId of postIds) {
    await fetch(`${baseUrl}/api/tts/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
  }

  // Clear the batch lock
  await fetch(`${baseUrl}/api/tts/batch-complete`, { method: "POST" });
}
