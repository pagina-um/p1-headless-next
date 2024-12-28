import { Responsive, WidthProvider } from "react-grid-layout";
import { CategoryBlock, StaticBlock, StoryBlock } from "@/types";
import { NewsStory } from "../blocks/NewsStory";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import "react-grid-layout/css/styles.css";
import { CategoryBlockServer } from "../blocks/CategoryBlock";
import { getGridSpan } from "@/utils/grid";

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
