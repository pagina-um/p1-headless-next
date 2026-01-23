"use workflow";

import { fetch } from "workflow";

const MAX_GENERATIONS = 3;

/**
 * TTS batch workflow.
 * Processes a list of candidate articles sequentially via HTTP calls to the generate endpoint.
 * Stops after MAX_GENERATIONS successful generations.
 * Ensures at most 1 Cartesia API call at a time.
 * Clears the global batch lock when done.
 */
export async function ttsBatchWorkflow(baseUrl: string, postIds: number[], internalSecret: string): Promise<void> {
  let generated = 0;
  const headers = {
    "Content-Type": "application/json",
    "x-internal-secret": internalSecret,
  };

  try {
    for (const postId of postIds) {
      if (generated >= MAX_GENERATIONS) break;

      const response = await fetch(`${baseUrl}/api/tts/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "generated") {
          generated++;
        }
      }
    }
  } finally {
    await fetch(`${baseUrl}/api/tts/batch-complete`, {
      method: "POST",
      headers: { "x-internal-secret": internalSecret },
    });
  }
}
