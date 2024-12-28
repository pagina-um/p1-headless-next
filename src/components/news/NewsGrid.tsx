import { Responsive, WidthProvider } from "react-grid-layout";
import { CategoryBlock, StaticBlock, StoryBlock } from "@/types";
import { NewsStory } from "../blocks/NewsStory";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import "react-grid-layout/css/styles.css";
import { CategoryBlockServer } from "../blocks/CategoryBlock";

interface NewsGridProps {
  blocks: (CategoryBlock | StaticBlock | StoryBlock)[];
}

export function NewsGrid({ blocks }: NewsGridProps) {
  const hasContent = blocks.length > 0;

  if (!hasContent) {
    return <EmptyState message="No content has been added to the grid yet." />;
  }
  return (
    <div className="layout grid grid-cols-1 lg:grid-cols-6 auto-rows-auto lg:auto-rows-52 gap-4">
      {blocks.map((block) => (
        <div
          key={block.uId}
          className={getGridSpan(
            block.gridPosition?.x,
            block.gridPosition?.y,
            block.gridPosition?.width,
            block.gridPosition?.height
          )}
        >
          {block.blockType === "story" ? (
            <NewsStory story={block} />
          ) : block.blockType === "category" ? (
            <CategoryBlockServer block={block} />
          ) : (
            <StaticBlockComponent block={block} />
          )}
        </div>
      ))}
    </div>
  );
}

const GRID_SPANS = {
  col: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
  },
  row: {
    1: "lg:row-span-1",
    2: "lg:row-span-2",
    3: "lg:row-span-3",
    4: "lg:row-span-4",
    5: "lg:row-span-5",
    6: "lg:row-span-6",
  },
  colStart: {
    0: "lg:col-start-1",
    1: "lg:col-start-2",
    2: "lg:col-start-3",
    3: "lg:col-start-4",
    4: "lg:col-start-5",
    5: "lg:col-start-6",
    6: "lg:col-start-7",
  },
  rowStart: {
    0: "lg:row-start-1",
    1: "lg:row-start-2",
    2: "lg:row-start-3",
    3: "lg:row-start-4",
    4: "lg:row-start-5",
    5: "lg:row-start-6",
    6: "lg:row-start-7",
  },
} as const;

function getGridSpan(x?: number, y?: number, width?: number, height?: number) {
  // Mobile is always single column, full width
  const baseClasses = ["col-span-1"];

  // Desktop layout (6 columns)
  if (x !== undefined && x >= 0 && x <= 6) {
    baseClasses.push(
      GRID_SPANS.colStart[x as keyof typeof GRID_SPANS.colStart]
    );
  }

  if (y !== undefined && y >= 0 && y <= 6) {
    baseClasses.push(
      GRID_SPANS.rowStart[y as keyof typeof GRID_SPANS.rowStart]
    );
  }

  const colSpan =
    !width || width < 1 || width > 6
      ? GRID_SPANS.col[1]
      : GRID_SPANS.col[width as keyof typeof GRID_SPANS.col];

  const rowSpan =
    !height || height < 1 || height > 6
      ? GRID_SPANS.row[1]
      : GRID_SPANS.row[height as keyof typeof GRID_SPANS.row];

  baseClasses.push(colSpan, rowSpan);

  return baseClasses.filter(Boolean).join(" ");
}
