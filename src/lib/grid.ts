import { GridState } from "@/types";
import { DEFAULT_GRID_CONFIG } from "@/constants/grid";

export function getInitialGridState(): GridState {
  // In a real app, this would fetch from an API
  return {
    gridConfig: DEFAULT_GRID_CONFIG,
    categoryBlocks: [],
    staticBlocks: [],
    lastUpdated: new Date().toISOString(),
  };
}
