import { Responsive, WidthProvider } from "react-grid-layout";
import { Story, CategoryBlock, StaticBlock } from "@/types";
import { NewsStory } from "./NewsStory";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import { generateLayouts, BREAKPOINTS, COLS } from "@/utils/gridLayoutUtils";
import "react-grid-layout/css/styles.css";
import { CategoryBlockServer } from "../blocks/CategoryBlock";

interface NewsGridProps {
  stories: Record<string, Story>;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
}

export function NewsGrid({
  stories = {},
  categoryBlocks = [],
  staticBlocks = [],
}: NewsGridProps) {
  const hasContent =
    Object.keys(stories).length > 0 ||
    categoryBlocks.length > 0 ||
    staticBlocks.length > 0;

  if (!hasContent) {
    return <EmptyState message="No content has been added to the grid yet." />;
  }
  return (
    <div className="layout grid grid-cols-6 grid-auto-rows-[200px]">
      {Object.values(stories).map((story) => {
        return (
          <div
            key={story.id}
            className={getGridSpan(
              story.gridPosition?.width,
              story.gridPosition?.height
            )}
          >
            <NewsStory id={story.id} />
          </div>
        );
      })}
      {categoryBlocks.map((block) => (
        <div
          key={block.id}
          className={getGridSpan(
            block.gridPosition?.width,
            block.gridPosition?.height
          )}
        >
          <CategoryBlockServer block={block} />
        </div>
      ))}
      {staticBlocks.map((block) => (
        <div
          key={block.id}
          className={getGridSpan(
            block.gridPosition?.width,
            block.gridPosition?.height
          )}
        >
          <StaticBlockComponent block={block} />
        </div>
      ))}
    </div>
  );
}

const GRID_SPANS = {
  col: {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
  },
  row: {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    5: "row-span-5",
    6: "row-span-6",
  },
} as const;

function getGridSpan(width?: number, height?: number) {
  const colSpan =
    !width || width < 1 || width > 6
      ? GRID_SPANS.col[1]
      : GRID_SPANS.col[width as keyof typeof GRID_SPANS.col];

  const rowSpan =
    !height || height < 1 || height > 6
      ? GRID_SPANS.row[1]
      : GRID_SPANS.row[height as keyof typeof GRID_SPANS.row];

  return `${colSpan} ${rowSpan}`;
}
