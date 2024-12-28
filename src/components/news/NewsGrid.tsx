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
    <div className="layout grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto sm:auto-rows-52 gap-4">
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
  // Column spans for tablet (2-column layout)
  tabletCol: {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-2",
    4: "sm:col-span-2",
    5: "sm:col-span-2",
    6: "sm:col-span-2",
  },
  // Column spans for desktop (6-column layout)
  desktopCol: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
  },
  row: {
    1: "row-span-1",
    2: "sm:row-span-2",
    3: "sm:row-span-3",
    4: "sm:row-span-4",
    5: "sm:row-span-5",
    6: "sm:row-span-6",
  },
  // Column start positions only apply on desktop
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
    0: "sm:row-start-1",
    1: "sm:row-start-2",
    2: "sm:row-start-3",
    3: "sm:row-start-4",
    4: "sm:row-start-5",
    5: "sm:row-start-6",
    6: "sm:row-start-7",
  },
} as const;

function getGridSpan(x?: number, y?: number, width?: number, height?: number) {
  // On mobile: always col-span-1 without explicit start position
  // On tablet (sm): 2 columns, use row spans/starts and limit col spans to max 2
  // On desktop (lg): full 6-column layout with all positioning

  const colStart =
    x !== undefined && x >= 0 && x <= 6
      ? GRID_SPANS.colStart[x as keyof typeof GRID_SPANS.colStart]
      : "";

  const rowStart =
    y !== undefined && y >= 0 && y <= 6
      ? GRID_SPANS.rowStart[y as keyof typeof GRID_SPANS.rowStart]
      : "";

  const tabletColSpan =
    !width || width < 1 || width > 6
      ? GRID_SPANS.tabletCol[1]
      : GRID_SPANS.tabletCol[width as keyof typeof GRID_SPANS.tabletCol];

  const desktopColSpan =
    !width || width < 1 || width > 6
      ? GRID_SPANS.desktopCol[1]
      : GRID_SPANS.desktopCol[width as keyof typeof GRID_SPANS.desktopCol];

  const rowSpan =
    !height || height < 1 || height > 6
      ? "row-span-1"
      : GRID_SPANS.row[height as keyof typeof GRID_SPANS.row];

  return `col-span-1 ${tabletColSpan} ${desktopColSpan} ${rowSpan} ${colStart} ${rowStart}`.trim();
}
