import { revalidatePath, revalidateTag } from "next/cache";
import {
  loadGridStateLocal,
  saveGridStateLocal,
} from "@/services/local-storage";
import { isDevelopment } from "@/services/config";
import { loadGridStateRedis, saveGridStateRedis } from "@/services/redis";

const STORAGE_FILENAME = "grid-state-cultura.json";
const STORAGE_KEY = "grid-state-cultura";
const CACHE_TAG = "cultura-grid";

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
      await saveGridStateLocal(gridState, STORAGE_FILENAME);
    } else {
      await saveGridStateRedis(gridState, STORAGE_KEY);
    }

    revalidateTag(CACHE_TAG);
    revalidatePath("/cultura");

    return Response.json({ revalidated: true });
  } catch (error) {
    console.error("Failed to save cultura grid state:", error);
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
      gridState = await loadGridStateLocal(STORAGE_FILENAME);
    } else {
      gridState = await loadGridStateRedis(STORAGE_KEY, CACHE_TAG);
      if (!gridState) {
        gridState = DEFAULT_GRID_STATE;
      }
    }

    return Response.json(gridState);
  } catch (error) {
    console.error("Failed to load cultura grid state:", error);
    return Response.json(DEFAULT_GRID_STATE);
  }
}
