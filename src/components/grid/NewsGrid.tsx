import { CategoryBlock, GridPosition, StaticBlock, StoryBlock } from "@/types";
import { NewsStory } from "../blocks/NewsStory/NewsStory";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import { CategoryBlockServer } from "../blocks/CategoryBlock";
import { GRID_SPANS } from "@/constants/blocks";

interface NewsGridProps {
  blocks: (CategoryBlock | StaticBlock | StoryBlock)[];
}

export function NewsGrid({ blocks }: NewsGridProps) {
  const hasContent = blocks.length > 0;
  const ROW_HEIGHT = 100; // Base row height in pixels

  if (!hasContent) {
    return <EmptyState message="No content has been added to the grid yet." />;
  }

  return (
    <div className="layout grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4">
      {blocks
        .sort((a, b) => {
          return zigZagSortingFuntion(a.gridPosition, b.gridPosition);
        })
        .map((block, i) => {
          return {
            block,
            unPrioritizedPosition: i,
          };
        })
        .sort((a, b) => {
          return (
            a.unPrioritizedPosition -
            (a.block.mobilePriority || 0) -
            (b.unPrioritizedPosition - (b.block.mobilePriority || 0))
          );
        })
        .map(({ block }) => (
          <div
            key={block.uId}
            className={getGridClasses(
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

function zigZagSortingFuntion(a: GridPosition, b: GridPosition, gridWidth = 6) {
  const aIndex = a.y * gridWidth + a.x;
  const bIndex = b.y * gridWidth + b.x;

  return aIndex - bIndex;
}
