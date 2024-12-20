import { Story, CategoryBlock } from '../types';

export function assignStoryToGrid(
  currentStories: Record<string, Story>,
  story: Story,
  x: number,
  y: number
): Record<string, Story> {
  // Remove story from its previous position if it exists
  const storiesWithoutCurrent = Object.entries(currentStories).reduce(
    (acc, [id, s]) => {
      if (id !== story.id) {
        acc[id] = s;
      }
      return acc;
    },
    {} as Record<string, Story>
  );

  // Add story to new position
  return {
    ...storiesWithoutCurrent,
    [story.id]: {
      ...story,
      gridPosition: {
        x,
        y,
        width: 1,
        height: 1,
      },
    },
  };
}

export function resizeStoryInGrid(
  currentStories: Record<string, Story>,
  storyId: string,
  width: number,
  height: number
): Record<string, Story> {
  if (!currentStories[storyId]) return currentStories;

  return {
    ...currentStories,
    [storyId]: {
      ...currentStories[storyId],
      gridPosition: {
        ...currentStories[storyId].gridPosition!,
        width,
        height,
      },
    },
  };
}

export function assignBlockToGrid(
  currentBlocks: CategoryBlock[],
  block: CategoryBlock,
  x: number,
  y: number
): CategoryBlock[] {
  // Remove block from its previous position if it exists
  const blocksWithoutCurrent = currentBlocks.filter(b => b.id !== block.id);

  // Add block to new position
  return [
    ...blocksWithoutCurrent,
    {
      ...block,
      gridPosition: {
        x,
        y,
        width: 2, // Default width for category blocks
        height: 2, // Default height for category blocks
      },
    },
  ];
}

export function resizeBlockInGrid(
  currentBlocks: CategoryBlock[],
  blockId: string,
  width: number,
  height: number
): CategoryBlock[] {
  return currentBlocks.map(block => {
    if (block.id !== blockId) return block;

    return {
      ...block,
      gridPosition: {
        ...block.gridPosition!,
        width,
        height,
      },
    };
  });
}