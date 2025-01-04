import { BLOCK_MIN_ROWS } from "@/constants/blocks";
import { loadGridState, saveGridState } from "@/services/jsonbin";
import { GridState, CategoryBlock, StaticBlock, StoryBlock } from "@/types";
import { useState, useEffect, useRef } from "react";
import * as RGL from "react-grid-layout";

export const useGrid = () => {
  const [gridState, setGridState] = useState<GridState>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  const [showToast, setShowToast] = useState(false);

  const handleClearLayout = () => {
    if (!gridState) return;
    setGridState({ ...gridState, blocks: [] });
  };

  const handleLayoutChange = (layout: RGL.Layout[]) => {
    if (!gridState) return;

    const updatedBlocks = gridState.blocks.map(
      <T extends CategoryBlock | StoryBlock | StaticBlock>(block: T): T => {
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
              postsPerPage: getPostsPerPageForBlockHeight(layoutItem.h),
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
      gridPosition: { x: 0, y: 0, width: 2, height: BLOCK_MIN_ROWS },
      uId: Date.now().toString(),
      postsPerPage: 3,
    };
    setGridState({
      ...gridState,
      blocks: [...gridState.blocks, newBlock],
    });
  };

  const handleCreateStaticBlock = (title: "newsletter" | "podcast") => {
    if (!gridState) return;
    const newBlock: StaticBlock = {
      uId: Date.now().toString(),
      blockType: "static",
      title,
      gridPosition: { x: 0, y: 0, width: 2, height: BLOCK_MIN_ROWS },
      content: "Static content",
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
      style: "modern",
      gridPosition: { x: 0, y: 0, width: 2, height: BLOCK_MIN_ROWS },
      wpPostId,
    };
    setGridState((prevState: any) => {
      const updatedState = {
        ...prevState,
        blocks: [...prevState.blocks, newBlock],
      };
      return updatedState;
    });
  };

  const handleUpdateCategoryBlock = (block: CategoryBlock) => {
    setGridState((prevState: any) => {
      const updatedBlocks = prevState.blocks.map((b: any) =>
        b.uId === block.uId ? block : b
      );
      return { ...prevState, blocks: updatedBlocks };
    });
  };
  const handleUpdateStoryBlock = (block: StoryBlock) => {
    console.log("handleUpdateStoryBlock", block);
    setGridState((prevState: any) => {
      const updatedBlocks = prevState.blocks.map((b: any) =>
        b.uId === block.uId ? block : b
      );
      return { ...prevState, blocks: updatedBlocks };
    });
  };

  return {
    gridState,
    handleLayoutChange,
    handleDeleteBlock,
    handleSave,
    handleCreateCategoryBlock,
    handleUpdateCategoryBlock,
    handleUpdateStoryBlock,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    showToast,
    setShowToast,
    isSaving,
    handleClearLayout,
    hasUnsavedChanges,
  };
};

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

const getPostsPerPageForBlockHeight = (height: number) => {
  if (height === 1) return 1;
  if (height === 2) return 1;
  if (height === 3) return 2;
  if (height === 4) return 3;
  if (height === 5) return 4;
  if (height === 6) return 5;
  return 6;
};
