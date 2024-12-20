"use client";

import { useState, useCallback, useEffect } from "react";
import { GridConfig, CategoryBlock, StaticBlock, GridState } from "@/types";
import { DEFAULT_GRID_CONFIG } from "@/constants/grid";
import { loadState, saveState, useGridPersistence } from "./useGridPersistence";

export function useGridState() {
  const [gridConfig, setGridConfig] = useState<GridConfig>(DEFAULT_GRID_CONFIG);
  const [categoryBlocks, setCategoryBlocks] = useState<CategoryBlock[]>([]);
  const [staticBlocks, setStaticBlocks] = useState<StaticBlock[]>([]);
  const [hasTriedToLoad, setHasTriedToLoad] = useState<boolean>(false);

  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      handleStateLoaded(savedState);
    }
    setHasTriedToLoad(true);
    console.log(savedState?.categoryBlocks);
  }, []);

  const handleStateLoaded = useCallback((state: GridState) => {
    setGridConfig(state.gridConfig);
    setCategoryBlocks(state.categoryBlocks);
    setStaticBlocks(state.staticBlocks);
  }, []);

  const handleSaveLayout = useCallback(
    (
      newConfig: GridConfig,
      newCategoryBlocks: CategoryBlock[],
      newStaticBlocks: StaticBlock[]
    ) => {
      setGridConfig(newConfig);
      setCategoryBlocks(newCategoryBlocks);
      setStaticBlocks(newStaticBlocks);
      saveState({
        gridConfig: newConfig,
        categoryBlocks: newCategoryBlocks,
        lastUpdated: new Date().toString(),
        staticBlocks: newStaticBlocks,
      });
    },
    []
  );

  return {
    gridConfig,
    categoryBlocks,
    staticBlocks,
    handleSaveLayout,
    hasTriedToLoad,
  };
}
