/**
 * TTS provider abstraction.
 * Routes to the configured provider based on FEATURES.TTS_PROVIDER.
 */

import { FEATURES } from "@/config/features";

export interface TTSProvider {
  generateFullArticleAudio(chunks: string[]): Promise<Buffer>;
  estimateDuration(buffer: Buffer): number;
}

export function getTTSProvider(): TTSProvider {
  switch (FEATURES.TTS_PROVIDER) {
    case "google": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const google = require("@/services/google-tts");
      return {
        generateFullArticleAudio: google.generateFullArticleAudio,
        estimateDuration: google.estimateDuration,
      };
    }
    case "cartesia":
    default: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cartesia = require("@/services/cartesia");
      return {
        generateFullArticleAudio: cartesia.generateFullArticleAudio,
        estimateDuration: cartesia.estimateDuration,
      };
    }
  }
}
