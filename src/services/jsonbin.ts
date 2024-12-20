import { GridState } from "../types";

const BIN_ID = process.env.JSON_BIN_ID;
const API_KEY = process.env.JSON_BIN_API_KEY;
const BASE_URL = process.env.JSON_BIN_BASE_URL;

export async function saveGridState(state: GridState): Promise<void> {
  if (!BIN_ID || !API_KEY || !BASE_URL) {
    console.error("JSON Bin environment variables not set");
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify({
        ...state,
        lastUpdated: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save state: ${response.statusText}`);
    }
  } catch (err) {
    console.error("Error saving grid state:", err);
    throw err;
  }
}

export async function loadGridState(): Promise<GridState | null> {
  if (!BIN_ID || !API_KEY || !BASE_URL) {
    console.error("JSON Bin environment variables not set");
    return null;
  }
  try {
    const response = await fetch(`${BASE_URL}/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
      next: { tags: ["homepage-grid"] },
    });

    if (!response.ok) {
      throw new Error(`Failed to load state: ${response.statusText}`);
    }

    const data = await response.json();
    return data.record as GridState;
  } catch (err) {
    console.error("Error loading grid state:", err);
    return null;
  }
}
