import { GridConfig, CategoryBlock, StaticBlock } from "../types";

export interface GridState {
  gridConfig: GridConfig;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
  lastUpdated: string;
}

const STORAGE_KEY = "grid_state_v1";

export const storageService = {
  saveState(state: GridState): void {
    try {
      const serializedState = JSON.stringify({
        ...state,
        lastUpdated: new Date().toISOString(),
      });
      //localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (err) {
      console.error("Error saving grid state:", err);
    }
  },

  loadState(): GridState | null {
    try {
      const serializedState = localStorage.getItem(STORAGE_KEY);
      if (!serializedState) return null;
      return JSON.parse(serializedState);
    } catch (err) {
      console.error("Error loading grid state:", err);
      return null;
    }
  },

  clearState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Error clearing grid state:", err);
    }
  },
};
