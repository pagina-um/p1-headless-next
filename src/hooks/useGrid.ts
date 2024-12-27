import { revalidate } from "@/app/[year]/[month]/[day]/[slug]/page";
import { loadGridState, saveGridState } from "@/services/jsonbin";
import { GridState, CategoryBlock, StaticBlock, StoryBlock } from "@/types";
import { revalidateTag } from "next/cache";
import { useState, useEffect } from "react";

export const useGrid = () => {
  const [gridState, setGridState] = useState<GridState>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchGridState = async () => {
      const gridState = await loadGridState();
      if (gridState) {
        setGridState(gridState);
      }
    };

    fetchGridState();
  }, []);

  const [showToast, setShowToast] = useState(false);

  const handleClearLayout = () => {
    if (!gridState) return;
    setGridState({ ...gridState, blocks: [] });
  };

  const handleLayoutChange = (layout: RGL.Layout[]) => {
    if (!gridState) return;

    const updatedBlocks = gridState.blocks.map((block) => {
      const layoutItem = layout.find((item) => item.i === block.uId);
      if (layoutItem) {
        return {
          ...block,
          gridPosition: {
            x: layoutItem.x,
            y: layoutItem.y,
            width: layoutItem.w,
            height: layoutItem.h,
          },
        };
      }
      return block;
    });

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
      await saveGridState(gridState);
      await fetch("/api/revalidate", { method: "POST" });
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
      gridPosition: { x: 0, y: 0, width: 2, height: 2 },
      uId: Date.now().toString(),
      postsPerPage: 5,
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
      gridPosition: { x: 0, y: 0, width: 2, height: 2 },
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
      gridPosition: { x: 0, y: 0, width: 2, height: 2 },
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

  return {
    gridState,
    handleLayoutChange,
    handleDeleteBlock,
    handleSave,
    handleCreateCategoryBlock,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    showToast,
    setShowToast,
    isSaving,
    handleClearLayout,
  };
};
