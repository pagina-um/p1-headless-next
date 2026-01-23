import { revalidatePath, revalidateTag } from "next/cache";
import {
  loadGridStateLocal,
  saveGridStateLocal,
} from "@/services/local-storage";
import { isDevelopment } from "@/services/config";
import { loadGridStateRedis, saveGridStateRedis } from "@/services/redis";
import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { FEATURES } from "@/config/features";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { GridState, StoryBlock } from "@/types";

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

async function triggerTTSForTopArticles(gridState: GridState) {
  const baseUrl = `https://${process.env.VERCEL_URL}`;
  const sorted = sortBlocksZigzagThenMobilePriority(gridState.blocks);
  const top3 = sorted
    .filter((b) => b.blockType === "story")
    .slice(0, 3)
    .map((b) => (b as StoryBlock).databaseId);

  await Promise.allSettled(
    top3.map((id) =>
      fetch(`${baseUrl}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      }).catch(() => {})
    )
  );
}
