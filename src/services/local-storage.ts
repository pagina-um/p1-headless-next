import fs from 'fs/promises';
import path from 'path';
import { GridState } from "../types";

const GRID_STATE_FILENAME = 'grid-state.json';
const DATA_DIR = path.join(process.cwd(), 'data');

// Default empty grid state
const DEFAULT_GRID_STATE: GridState = {
  blocks: [],
  createdAt: new Date().toISOString()
};

// Ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (err) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function saveGridStateLocal(state: GridState): Promise<void> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, GRID_STATE_FILENAME);
    await fs.writeFile(
      filePath,
      JSON.stringify({
        ...state,
        lastUpdated: new Date().toISOString(),
      }, null, 2)
    );
  } catch (err) {
    console.error("Error saving grid state to local filesystem:", err);
    throw err;
  }
}

export async function loadGridStateLocal(): Promise<GridState> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, GRID_STATE_FILENAME);
    
    try {
      await fs.access(filePath);
    } catch (err) {
      // File doesn't exist, return default empty state
      return DEFAULT_GRID_STATE;
    }
    
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as GridState;
  } catch (err) {
    console.error("Error loading grid state from local filesystem:", err);
    return DEFAULT_GRID_STATE; // Return default state on error instead of null
  }
}