"use client";

import { useState, useCallback, useEffect } from "react";
import { GridConfig, CategoryBlock, StaticBlock, GridState } from "@/types";
import { DEFAULT_GRID_CONFIG } from "@/constants/grid";
import { loadGridState, saveGridState } from "../services/jsonbin";

export function useGridState() {
  const [gridConfig, setGridConfig] = useState<GridConfig>(DEFAULT_GRID_CONFIG);
  const [categoryBlocks, setCategoryBlocks] = useState<CategoryBlock[]>([]);
  const [staticBlocks, setStaticBlocks] = useState<StaticBlock[]>([]);
  const [hasTriedToLoad, setHasTriedToLoad] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    async function loadState() {
      try {
        const savedState = await loadGridState();
        if (savedState) {
          setGridConfig(savedState.gridConfig);
          setCategoryBlocks(savedState.categoryBlocks);
          setStaticBlocks(savedState.staticBlocks);
        }
      } catch (error) {
        console.error("Failed to load grid state:", error);
      } finally {
        setHasTriedToLoad(true);
        setIsLoading(false);
      }
    }

    loadState();
  }, []);

  const handleSaveLayout = useCallback(
    async (
      newConfig: GridConfig,
      newCategoryBlocks: CategoryBlock[],
      newStaticBlocks: StaticBlock[]
    ) => {
      try {
        setGridConfig(newConfig);
        setCategoryBlocks(newCategoryBlocks);
        setStaticBlocks(newStaticBlocks);

        await saveGridState({
          gridConfig: newConfig,
          categoryBlocks: newCategoryBlocks,
          staticBlocks: newStaticBlocks,
          lastUpdated: new Date().toISOString(),
        });
        await fetch("/api/revalidate", { method: "POST" });
      } catch (error) {
        console.error("Failed to save grid state:", error);
        // You might want to show a user-friendly error message here
      }
    },
    []
  );

  return {
    gridConfig,
    categoryBlocks,
    staticBlocks,
    handleSaveLayout,
    hasTriedToLoad,
    isLoading,
  };
}
