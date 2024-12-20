import { Layout } from "react-grid-layout";
import { Story, CategoryBlock, StaticBlock } from "../types";
import { BLOCK_DEFAULT_SIZES } from "../constants/blocks";

// Breakpoint configurations
export const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

export const COLS = {
  lg: 6,
  md: 4,
  sm: 2,
  xs: 1,
  xxs: 1,
};

function createResponsiveLayout(
  layout: Layout[],
  breakpoint: keyof typeof COLS
): Layout[] {
  const cols = COLS[breakpoint];

  return layout.map((item) => {
    // Adjust widths for different breakpoints
    let width = item.w;
    if (breakpoint === "sm") {
      width = Math.min(2, item.w);
    } else if (breakpoint === "xs" || breakpoint === "xxs") {
      width = 1;
    }

    // For smaller screens, stack items vertically
    const newItem = {
      ...item,
      w: width,
      x: breakpoint === "xs" || breakpoint === "xxs" ? 0 : item.x % cols,
    };

    return newItem;
  });
}

export function generateLayouts(
  stories: Record<string, Story>,
  categoryBlocks: CategoryBlock[],
  staticBlocks: StaticBlock[]
) {
  // Create base layout
  const baseLayout = [
    ...Object.values(stories).map((story) => ({
      i: story.id,
      x: story.gridPosition?.x || 0,
      y: story.gridPosition?.y || 0,
      w: story.gridPosition?.width || BLOCK_DEFAULT_SIZES.story.width,
      h: story.gridPosition?.height || BLOCK_DEFAULT_SIZES.story.height,
      static: true,
    })),
    ...categoryBlocks.map((block) => ({
      i: block.id,
      x: block.gridPosition?.x || 0,
      y: block.gridPosition?.y || 0,
      w: block.gridPosition?.width || BLOCK_DEFAULT_SIZES.category.width,
      h: block.gridPosition?.height || BLOCK_DEFAULT_SIZES.category.height,
      static: true,
    })),
    ...staticBlocks.map((block) => ({
      i: block.id,
      x: block.gridPosition?.x || 0,
      y: block.gridPosition?.y || 0,
      w:
        block.gridPosition?.width ||
        (block.id.includes("newsletter")
          ? BLOCK_DEFAULT_SIZES.newsletter.width
          : BLOCK_DEFAULT_SIZES.podcast.width),
      h:
        block.gridPosition?.height ||
        (block.id.includes("newsletter")
          ? BLOCK_DEFAULT_SIZES.newsletter.height
          : BLOCK_DEFAULT_SIZES.podcast.height),
      static: true,
    })),
  ];

  // Generate responsive layouts
  return {
    lg: baseLayout,
    md: createResponsiveLayout(baseLayout, "md"),
    sm: createResponsiveLayout(baseLayout, "sm"),
    xs: createResponsiveLayout(baseLayout, "xs"),
    xxs: createResponsiveLayout(baseLayout, "xxs"),
  };
}
