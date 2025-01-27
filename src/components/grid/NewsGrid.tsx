import { Block } from "@/types";
import { NewsStoryServer } from "../blocks/NewsStory/NewsStory.server";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import { CategoryBlockServer } from "../blocks/CategoryBlock.server";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { twMerge } from "tailwind-merge";
import { CategoryCarouselServer } from "../ui/CategoryCarousel.server";

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
    <div className="layout grid grid-cols-1 lg:grid-cols-10 gap-4 lg:mt-4 lg:mx-4">
      {sortedBlocks.map((block) => {
        const isLandscape =
          block.gridPosition.width * 1.5 > block.gridPosition.height;
        return (
          <div
            key={block.uId}
            className={twMerge(
              "col-span-1",
              `lg:col-start-${block.gridPosition.x + 1}`,
              `lg:col-span-${block.gridPosition.width}`,
              `lg:row-start-${block.gridPosition.y + 1}`,
              `lg:row-span-${block.gridPosition.height}`
            )}
          >
            {block.blockType === "story" ? (
              <NewsStoryServer story={block} />
            ) : block.blockType === "category" ? (
              isLandscape ? (
                <CategoryCarouselServer
                  block={block}
                  cardsPerView={block.postsPerPage} // Optional: number of cards visible at once
                />
              ) : (
                <CategoryBlockServer block={block} />
              )
            ) : (
              <StaticBlockComponent block={block} />
            )}
          </div>
        );
      })}
    </div>
  );
}
