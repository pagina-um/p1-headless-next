"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { BLOCK_MIN_ROWS, STATIC_BLOCKS } from "@/constants/blocks";
import {
  GridState,
  CategoryBlock,
  StaticBlock,
  StoryBlock,
  OverridableField,
  Block,
} from "@/types";
import type { StaticBlockType } from "@/types";
import * as RGL from "react-grid-layout";
import {
  findEmptySpaces,
  makeNewBlockOccupyFirstEmptySpace,
  visualizeGrid,
} from "@/utils/grid";
import { getStoryPostsIds } from "@/utils/categoryUtils";
import { getGridLayout, getActiveGridLayout } from "@/app/(payload)/admin/grid-editor/actions";

type GridContextType = {
  gridState: GridState | undefined;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  showToast: boolean;
  allPostsIdsInStoryBlock: string[];
  setShowToast: (show: boolean) => void;
  handleLayoutChange: (layout: RGL.Layout[]) => void;
  handleDeleteBlock: (uId: string) => void;
  handleSave: () => Promise<void>;
  handleCreateCategoryBlock: (categoryId: string, name: string, wpDatabaseId?: number) => void;
  handleUpdateBlockSettings: (block: Block) => void;
  handleCreateStaticBlock: (title: StaticBlockType) => void;
  handleCreateStoryBlock: (databaseId: number, postId: string) => void;
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

export function GridProvider({
  children,
  layoutId = null
}: {
  children: React.ReactNode;
  layoutId?: string | null;
}) {
  const [gridState, setGridState] = useState<GridState>(initialGridState);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const originalGridStateRef = useRef<GridState | null>(null);

  // Load initial grid state
  useEffect(() => {
    const fetchGridState = async () => {
      try {
        // If layoutId is provided, load that specific layout
        // Otherwise, load the active layout
        const data = layoutId
          ? await getGridLayout(layoutId)
          : await getActiveGridLayout();

        // Extract gridState from the layout object (gridState is stored as JSON)
        const fetchedGridState = (data?.gridState as unknown as GridState) || initialGridState;

        setGridState(fetchedGridState);
        originalGridStateRef.current = JSON.parse(
          JSON.stringify(fetchedGridState)
        );
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Failed to load grid state:", error);
        setGridState(initialGridState);
      }
    };

    fetchGridState();
  }, [layoutId]);

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
    // This function is now mainly used to update the local state after save
    // The actual API call is handled by GridEditorToolbar or other components
    if (!gridState) return;

    // Update the original state to match current state (mark as saved)
    originalGridStateRef.current = JSON.parse(JSON.stringify(gridState));
    setHasUnsavedChanges(false);
    setShowToast(true);
  };

  const handleCreateCategoryBlock = (categoryId: string, name: string, wpDatabaseId?: number) => {
    if (!gridState) return;
    const newBlock: CategoryBlock = {
      categoryId,
      wpCategoryId: wpDatabaseId,
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

  const handleCreateStaticBlock = (type: StaticBlockType) => {
    if (!gridState) return;
    const newBlock: StaticBlock = {
      uId: Date.now().toString(),
      title: STATIC_BLOCKS[type].title,
      blockType: "static",
      type,
      ...makeNewBlockOccupyFirstEmptySpace(gridState.blocks),
      content: "Static content",
      mobilePriority: null,
    };
    setGridState({
      ...gridState,
      blocks: [...gridState.blocks, newBlock],
    });
  };

  const handleCreateStoryBlock = (databaseId: number, postId: string) => {
    if (!gridState) return;

    const newBlock: StoryBlock = {
      uId: Date.now().toString(),
      blockType: "story",
      style: "classic",
      databaseId,
      postId,
      mobilePriority: null,
      ...makeNewBlockOccupyFirstEmptySpace(gridState.blocks),
      objectPosition: "center",
      hideImage: false,
      reverse: false,
      expandImage: false,
      extraBigTitle: false,
      antetituloColor: "auto",
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

  const allPostsIdsInStoryBlock =
    getStoryPostsIds(gridState?.blocks || []) || [];

  const value = {
    gridState,
    isSaving,
    hasUnsavedChanges,
    showToast,
    allPostsIdsInStoryBlock,
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
