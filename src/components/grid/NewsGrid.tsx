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
    <div className="layout grid grid-cols-1 lg:grid-cols-10 gap-4 mt-4">
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
    classes.push(`lg-col-start-${x + 1}`);
  }

  if (y !== undefined && y >= 0) {
    classes.push(`lg-row-start-${y + 1}`);
  }

  const colSpan =
    !width || width < 1 ? `lg:col-span-1` : `lg:col-span-${width}`;

  const rowSpan =
    !height || height < 1 ? `lg:row-span-1` : `lg:row-span-${height}`;

  classes.push(colSpan, rowSpan);

  return classes.filter(Boolean).join(" ");
}
