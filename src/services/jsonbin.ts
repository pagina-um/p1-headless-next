import { GridState } from "../types";

const BIN_ID = "67645c9be41b4d34e4683324";
const API_KEY = "$2a$10$EsuKsuP29YJUgx1HHnYZKe9FOgMKyNDAAc91p5e1bk4WzTJRbG7SC";
const BASE_URL = "https://api.jsonbin.io/v3/b";

export async function saveGridState(state: GridState): Promise<void> {
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
    console.log("asd", data.record);
    return data.record as GridState;
  } catch (err) {
    console.error("Error loading grid state:", err);
    return null;
  }
}
