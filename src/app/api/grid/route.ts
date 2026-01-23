import { revalidatePath, revalidateTag } from "next/cache";
import {
  loadGridStateLocal,
  saveGridStateLocal,
} from "@/services/local-storage";
import { isDevelopment } from "@/services/config";
import { loadGridStateRedis, saveGridStateRedis } from "@/services/redis";
import { waitUntil } from "@vercel/functions";
import { FEATURES } from "@/config/features";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { GridState, StoryBlock } from "@/types";
import { getTTSMetadata, acquireTTSBatchLock } from "@/services/tts-cache";
import { start } from "workflow/api";
import { ttsBatchWorkflow } from "../tts/workflow";

// Default empty grid state
const DEFAULT_GRID_STATE = {
  blocks: [],
  createdAt: new Date().toISOString(),
};

export async function POST(request: Request) {
  const gridState = await request.json();
  if (!gridState) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (isDevelopment) {
      await saveGridStateLocal(gridState);
    } else {
      await saveGridStateRedis(gridState);
    }

    revalidateTag("homepage-grid"); // Revalidate all fetches with this tag
    revalidatePath("/");

    if (FEATURES.TTS_ENABLED && process.env.VERCEL_ENV === "production") {
      waitUntil(triggerTTSForTopArticles(gridState));
    }

    return Response.json({ revalidated: true });
  } catch (error) {
    console.error("Failed to save grid state:", error);
    return Response.json(
      { error: "Failed to save grid state" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let gridState;

    if (isDevelopment) {
      gridState = await loadGridStateLocal();
    } else {
      gridState = await loadGridStateRedis();
      // If Redis returns null, use default empty state
      if (!gridState) {
        gridState = DEFAULT_GRID_STATE;
      }
    }

    return Response.json(gridState);
  } catch (error) {
    console.error("Failed to load grid state:", error);
    return Response.json(DEFAULT_GRID_STATE);
  }
}

/**
 * Trigger TTS generation for top 5 articles.
 * Acquires a global batch lock so only one batch runs at a time,
 * ensuring sequential Cartesia API usage (no concurrent calls).
 */
async function triggerTTSForTopArticles(gridState: GridState) {
  const sorted = sortBlocksZigzagThenMobilePriority(gridState.blocks);
  const top5 = sorted
    .filter((b) => b.blockType === "story")
    .slice(0, 5) as StoryBlock[];

  // Filter to articles that don't already have TTS
  const needsGeneration: number[] = [];
  for (const block of top5) {
    const existing = await getTTSMetadata(block.databaseId);
    if (!existing) {
      needsGeneration.push(block.databaseId);
    }
  }

  if (needsGeneration.length === 0) return;

  // Acquire global lock — if a batch is already running, skip
  const acquired = await acquireTTSBatchLock();
  if (!acquired) return;

  const baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`;
  await start(ttsBatchWorkflow, [baseUrl, needsGeneration]);
}
