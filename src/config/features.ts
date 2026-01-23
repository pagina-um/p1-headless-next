/**
 * Feature flags for the application.
 * Toggle features on/off by changing the values here.
 */

export const FEATURES = {
  /** Enable TTS (text-to-speech) audio playback for articles */
  TTS_ENABLED: true,
  /** TTS provider: "cartesia" or "google" */
  TTS_PROVIDER: "google" as "cartesia" | "google",
} as const;
