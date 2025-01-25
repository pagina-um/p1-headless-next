"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { BLOCK_MIN_ROWS } from "@/constants/blocks";
import {
  GridState,
  CategoryBlock,
  StaticBlock,
  StoryBlock,
  OverridableField,
  Block,
} from "@/types";
import * as RGL from "react-grid-layout";
import {
  findEmptySpaces,
  makeNewBlockOccupyFirstEmptySpace,
  visualizeGrid,
} from "@/utils/grid";

type GridContextType = {
  gridState: GridState | undefined;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  showToast: boolean;
  setShowToast: (show: boolean) => void;
  handleLayoutChange: (layout: RGL.Layout[]) => void;
  handleDeleteBlock: (uId: string) => void;
  handleSave: () => Promise<void>;
  handleCreateCategoryBlock: (id: number, name: string) => void;
  handleUpdateBlockSettings: (block: Block) => void;
  handleCreateStaticBlock: (
    title: "newsletter" | "podcast" | "divider"
  ) => void;
  handleCreateStoryBlock: (wpPostId: number) => void;
  handleClearLayout: () => void;
  handleOverrideStoryBlockField: (
    blockUid: string,
    fieldName: OverridableField,
    fieldText: string
  ) => void;
  handleResetChanges: () => void;
};

const GridContext = createContext<GridContextType | undefined>(undefined);

const initialGridState: GridState = {
  blocks: [],
  createdAt: "",
};

export function GridProvider({ children }: { children: React.ReactNode }) {
  const [gridState, setGridState] = useState<GridState>(initialGridState);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const originalGridStateRef = useRef<GridState | null>(null);

  // Load initial grid state
  useEffect(() => {
    const fetchGridState = async () => {
      const response = await fetch("/api/grid");
      const fetchedGridState = await response.json();
      if (fetchedGridState) {
        setGridState(fetchedGridState);
        originalGridStateRef.current = JSON.parse(
          JSON.stringify(fetchedGridState)
        );
        setHasUnsavedChanges(false);
      }
    };

    fetchGridState();
  }, []);

  // Check for unsaved changes whenever gridState updates
  useEffect(() => {
    if (!gridState || !originalGridStateRef.current) return;

    const currentBlocks = sortAndNormalizeBlocks(gridState.blocks);
    const originalBlocks = sortAndNormalizeBlocks(
      originalGridStateRef.current.blocks
    );

    const hasChanges =
      JSON.stringify(currentBlocks) !== JSON.stringify(originalBlocks);
    setHasUnsavedChanges(hasChanges);
  }, [gridState]);

  const handleClearLayout = () => {
    if (!gridState) return;
    setGridState({ ...gridState, blocks: [] });
  };

  const handleResetChanges = () => {
    if (!originalGridStateRef.current) return;
    setGridState(JSON.parse(JSON.stringify(originalGridStateRef.current)));
    setHasUnsavedChanges(false);
  };

  const handleLayoutChange = (layout: RGL.Layout[]) => {
    if (!gridState) return;
    const updatedBlocks = gridState.blocks.map(
      <T extends Block>(block: T): T => {
        const layoutItem = layout.find((item) => item.i === block.uId);
        if (layoutItem) {
          const baseUpdate = {
            ...block,
            gridPosition: {
              x: layoutItem.x,
              y: layoutItem.y,
              width: layoutItem.w,
              height: layoutItem.h,
            },
          };

          if (block.blockType === "category") {
            return {
              ...baseUpdate,
              postsPerPage: didBlockSizeChange(block, layoutItem)
                ? getPostsPerPageForBlockArea(layoutItem.h, layoutItem.w)
                : block.postsPerPage,
            } as T;
          }

          return baseUpdate as T;
        }
        return block;
      }
    );

    setGridState({ ...gridState, blocks: updatedBlocks });
  };

  const handleDeleteBlock = (uId: string) => {
    if (!gridState) return;
    setGridState({
      ...gridState,
      blocks: gridState.blocks.filter((block) => block.uId !== uId),
    });
  };

  const handleSave = async () => {
    if (!gridState) return;
    try {
      setIsSaving(true);
      await fetch("/api/grid", {
        method: "POST",
        body: JSON.stringify(gridState),
      });

      originalGridStateRef.current = JSON.parse(JSON.stringify(gridState));
      setHasUnsavedChanges(false);
      setShowToast(true);
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
      console.error("Failed to save grid state:", error);
    }
  };

  const handleCreateCategoryBlock = (id: number, name: string) => {
    if (!gridState) return;
    const newBlock: CategoryBlock = {
      wpCategoryId: id,
      wpCategoryName: name,
      blockType: "category",
      ...makeNewBlockOccupyFirstEmptySpace(gridState.blocks),
      uId: Date.now().toString(),
      postsPerPage: 3,
      mobilePriority: null,
    };
    setGridState({
      ...gridState,
      blocks: [...gridState.blocks, newBlock],
    });
  };

  const handleCreateStaticBlock = (
    title: "newsletter" | "podcast" | "divider"
  ) => {
    if (!gridState) return;
    const newBlock: StaticBlock = {
      uId: Date.now().toString(),
      blockType: "static",
      title,
      ...makeNewBlockOccupyFirstEmptySpace(gridState.blocks),
      content: "Static content",
      mobilePriority: null,
    };
    setGridState({
      ...gridState,
      blocks: [...gridState.blocks, newBlock],
    });
  };

  const handleCreateStoryBlock = (wpPostId: number) => {
    if (!gridState) return;

    const newBlock: StoryBlock = {
      uId: Date.now().toString(),
      blockType: "story",
      style: "classic",
      wpPostId,
      mobilePriority: null,
      ...makeNewBlockOccupyFirstEmptySpace(gridState.blocks),
      objectPosition: "center",
      hideImage: false,
      reverse: false,
      expandImage: false,
      extraBigTitle: false,
    };
    setGridState((prevState: GridState) => ({
      ...prevState,
      blocks: [...prevState.blocks, newBlock],
    }));
  };

  const handleUpdateBlockSettings = (block: Block) => {
    setGridState((prevState: any) => {
      const updatedBlocks = prevState.blocks.map((b: Block) =>
        b.uId === block.uId ? block : b
      );
      return { ...prevState, blocks: updatedBlocks };
    });
  };

  const handleOverrideStoryBlockField = (
    blockUid: string,
    fieldName: OverridableField,
    fieldText: string
  ) => {
    setGridState((prevState: any) => {
      const updatedBlocks = prevState.blocks.map((b: any) =>
        b.uId === blockUid ? { ...b, [fieldName]: fieldText } : b
      );
      return { ...prevState, blocks: updatedBlocks };
    });
  };

  const value = {
    gridState,
    isSaving,
    hasUnsavedChanges,
    showToast,
    setShowToast,
    handleLayoutChange,
    handleDeleteBlock,
    handleSave,
    handleCreateCategoryBlock,
    handleUpdateBlockSettings,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    handleClearLayout,
    handleOverrideStoryBlockField,
    handleResetChanges,
  };

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

// Helper hook for using the context
export function useGrid() {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error("useGrid must be used within a GridProvider");
  }
  return context;
}

// Helper functions
const sortAndNormalizeBlocks = (blocks: any[]) => {
  return blocks
    .slice()
    .sort((a, b) => a.uId.localeCompare(b.uId))
    .map((block) => ({
      ...block,
      gridPosition: {
        x: Number(block.gridPosition.x),
        y: Number(block.gridPosition.y),
        width: Number(block.gridPosition.width),
        height: Number(block.gridPosition.height),
      },
    }));
};

const getPostsPerPageForBlockArea = (height: number, width: number): number => {
  const isLandscape = width * 1.5 > height;
  if (isLandscape) {
    return Math.floor(width / 2);
  }
  return Math.floor(height / 1.5);
};

const didBlockSizeChange = (block: Block, layoutItem: RGL.Layout) => {
  const blockSizeChanged =
    block.gridPosition.width !== layoutItem.w ||
    block.gridPosition.height !== layoutItem.h;
  if (blockSizeChanged) {
    console.log(block.blockType, "block size changed");
  }
  return blockSizeChanged;
};
