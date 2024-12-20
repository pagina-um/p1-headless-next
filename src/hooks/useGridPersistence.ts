"use client";

import { useEffect } from "react";
import { GridConfig, CategoryBlock, StaticBlock, GridState } from "@/types";

interface UseGridPersistenceProps {
  gridConfig: GridConfig;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
  onStateLoaded?: (state: GridState) => void;
}

const STORAGE_KEY = "grid_state_v1";

export function saveState(state: GridState): void {
  try {
    const serializedState = JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Error saving grid state:", err);
  }
}

export function loadState(): GridState | null {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return null;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading grid state:", err);
    return null;
  }
}

export function useGridPersistence({
  gridConfig,
  categoryBlocks,
  staticBlocks,
  onStateLoaded,
}: UseGridPersistenceProps) {
  // Load state on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState && onStateLoaded) {
      onStateLoaded(savedState);
    }
  }, [onStateLoaded]);

  // Save state when it changes

  return {
    clearState: () => localStorage.removeItem(STORAGE_KEY),
  };
}
