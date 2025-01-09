import {
  Block,
  CategoryBlock,
  GridPosition,
  StaticBlock,
  StoryBlock,
} from "@/types";
import { NewsStoryServer } from "../blocks/NewsStory/NewsStory.server";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import { CategoryBlockServer } from "../blocks/CategoryBlock";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { useMemo } from "react";

interface NewsGridProps {
  blocks: Block[];
}

export function NewsGrid({ blocks }: NewsGridProps) {
  const hasContent = blocks.length > 0;

  if (!hasContent) {
    return <EmptyState message="No content has been added to the grid yet." />;
  }

  const sortedBlocks = sortBlocksZigzagThenMobilePriority(blocks, 6);

  return (
    <div className="layout grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4">
      {sortedBlocks.map((block) => {
        const gridClasses = useMemo(
          () =>
            getGridClasses(
              block.gridPosition?.x,
              block.gridPosition?.y,
              block.gridPosition?.width,
              block.gridPosition?.height
            ),
          [block.gridPosition]
        );
        return (
          <div key={block.uId} className={gridClasses}>
            {block.blockType === "story" ? (
              <NewsStoryServer story={block} />
            ) : block.blockType === "category" ? (
              <CategoryBlockServer block={block} />
            ) : (
              <StaticBlockComponent block={block} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getGridClasses(x: number, y: number, width: number, height: number) {
  const classes = ["col-span-1"];

  if (x !== undefined && x >= 0) {
    classes.push(GRID_SPANS.colStart[x as keyof typeof GRID_SPANS.colStart]);
  }

  if (y !== undefined && y >= 0) {
    classes.push(GRID_SPANS.rowStart[y as keyof typeof GRID_SPANS.rowStart]);
  }

  const colSpan =
    !width || width < 1 || width > Object.keys(GRID_SPANS.col).length
      ? GRID_SPANS.col[1]
      : GRID_SPANS.col[width as keyof typeof GRID_SPANS.col];

  const rowSpan =
    !height || height < 1 || height > Object.keys(GRID_SPANS.row).length
      ? GRID_SPANS.row[1]
      : GRID_SPANS.row[height as keyof typeof GRID_SPANS.row];

  classes.push(colSpan, rowSpan);

  return classes.filter(Boolean).join(" ");
}

// dont know why but this needs to live on the same file as the component. some Tailwdind quirk
export const GRID_SPANS = {
  col: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
  },
  row: {
    1: "lg:row-span-1",
    2: "lg:row-span-2",
    3: "lg:row-span-3",
    4: "lg:row-span-4",
    5: "lg:row-span-5",
    6: "lg:row-span-6",
    7: "lg:row-span-7",
    8: "lg:row-span-8",
    9: "lg:row-span-9",
    10: "lg:row-span-10",
  },
  colStart: {
    0: "lg:col-start-1",
    1: "lg:col-start-2",
    2: "lg:col-start-3",
    3: "lg:col-start-4",
    4: "lg:col-start-5",
    5: "lg:col-start-6",
    6: "lg:col-start-7",
    7: "lg:col-start-8",
    8: "lg:col-start-9",
    9: "lg:col-start-10",
    10: "lg:col-start-11",
    11: "lg:col-start-12",
    12: "lg:col-start-13",
  },
  rowStart: {
    0: "lg:row-start-1",
    1: "lg:row-start-2",
    2: "lg:row-start-3",
    3: "lg:row-start-4",
    4: "lg:row-start-5",
    5: "lg:row-start-6",
    6: "lg:row-start-7",
    7: "lg:row-start-8",
    8: "lg:row-start-9",
    9: "lg:row-start-10",
    10: "lg:row-start-11",
    11: "lg:row-start-12",
    12: "lg:row-start-13",
  },
} as const;
