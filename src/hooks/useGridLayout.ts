import { useState, useCallback } from "react";
import { Layout } from "react-grid-layout";
import { GridConfig, Story, CategoryBlock, StaticBlock } from "../types";
import { STATIC_BLOCKS, BLOCK_DEFAULT_SIZES } from "../constants/blocks";
import { GRID_COLUMNS } from "../constants/grid";
import { convertWPPostToStory } from "../utils/wpUtils";
import type { WPPost } from "../types/wordpress";

function updateGridPositionFromLayout(layout: Layout[]) {
  return layout.reduce((acc, item) => {
    acc[item.i] = {
      x: item.x,
      y: item.y,
      width: item.w,
      height: item.h,
    };
    return acc;
  }, {} as Record<string, { x: number; y: number; width: number; height: number }>);
}

export function useGridLayout(
  initialConfig: GridConfig,
  initialCategoryBlocks: CategoryBlock[] = [],
  initialStaticBlocks: StaticBlock[] = []
) {
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    ...initialConfig,
    columns: GRID_COLUMNS,
  });
  const [categoryBlocks, setCategoryBlocks] = useState<CategoryBlock[]>(
    initialCategoryBlocks
  );
  const [staticBlocks, setStaticBlocks] =
    useState<StaticBlock[]>(initialStaticBlocks);

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    const positions = updateGridPositionFromLayout(layout);

    // Update stories
    setGridConfig((prev) => ({
      ...prev,
      stories: Object.fromEntries(
        Object.entries(prev.stories).map(([id, story]) => [
          id,
          {
            ...story,
            gridPosition: positions[id] || story.gridPosition,
          },
        ])
      ),
    }));

    // Update category blocks
    setCategoryBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        gridPosition: positions[block.id] || block.gridPosition,
      }))
    );

    // Update static blocks
    setStaticBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        gridPosition: positions[block.id] || block.gridPosition,
      }))
    );
  }, []);

  const handleUpdateCategoryBlock = (updatedBlock: CategoryBlock) => {
    setCategoryBlocks((prev) =>
      prev.map((block) => (block.id === updatedBlock.id ? updatedBlock : block))
    );
  };

  const handleDeleteStory = (storyId: string) => {
    setGridConfig((prev) => {
      const { [storyId]: _, ...remainingStories } = prev.stories;
      return {
        ...prev,
        stories: remainingStories,
      };
    });
  };

  const handleDeleteCategoryBlock = (blockId: string) => {
    setCategoryBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  const handleDeleteStaticBlock = (blockId: string) => {
    setStaticBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  const addStory = (post: WPPost) => {
    const story = convertWPPostToStory(post);

    // Find the lowest available y position
    const occupiedPositions = [
      ...Object.values(gridConfig.stories),
      ...categoryBlocks,
      ...staticBlocks,
    ].map((item) => item.gridPosition);

    let maxY = 0;
    occupiedPositions.forEach((pos) => {
      if (pos) {
        maxY = Math.max(maxY, pos.y + pos.height);
      }
    });

    // Add the story with default position and size
    setGridConfig((prev) => ({
      ...prev,
      stories: {
        ...prev.stories,
        [story.id]: {
          ...story,
          gridPosition: {
            x: 0,
            y: maxY,
            ...BLOCK_DEFAULT_SIZES.story,
          },
        },
      },
    }));
  };
  return {
    gridConfig,
    categoryBlocks,
    staticBlocks,
    handleLayoutChange,
    addStory,
    handleDeleteStory,
    handleDeleteCategoryBlock,
    handleDeleteStaticBlock,
    handleUpdateCategoryBlock,
    handleCreateCategoryBlock: (categoryId: number, title: string) => {
      const newBlock: CategoryBlock = {
        id: `category-${categoryId}-${Date.now()}`,
        categoryId,
        title,
        postsPerPage: 5,
        gridPosition: {
          x: 0,
          y: 0,
          ...BLOCK_DEFAULT_SIZES.category,
        },
      };
      setCategoryBlocks((prev) => [...prev, newBlock]);
    },
    handleCreateStaticBlock: (block: { title: string; content: string }) => {
      const newBlock: StaticBlock = {
        id: `static-${block.title
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}`,
        ...block,
        gridPosition: {
          x: 0,
          y: 0,
          ...BLOCK_DEFAULT_SIZES.story,
        },
      };
      setStaticBlocks((prev) => [...prev, newBlock]);
    },
  };
}
