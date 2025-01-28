"use client";

import { Block } from "@/types";
import { NewsStoryClient } from "../blocks/NewsStory/NewsStory.client";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import { CategoryBlockClient } from "../blocks/CategoryBlock.client";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { twMerge } from "tailwind-merge";
import { CategoryCarouselClient } from "../ui/CategoryCarousel.client";

interface NewsGridProps {
  blocks: Block[];
}

// only for the preview page
export function NewsGridClient({ blocks }: NewsGridProps) {
  const hasContent = blocks.length > 0;

  if (!hasContent) {
    return <EmptyState message="No content has been added to the grid yet." />;
  }

  const sortedBlocks = sortBlocksZigzagThenMobilePriority(blocks, 6);

  return (
    <div className="layout grid grid-cols-1 lg:grid-cols-10 gap-4 lg:mt-4">
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
              <NewsStoryClient story={block} />
            ) : block.blockType === "category" ? (
              isLandscape ? (
                <CategoryCarouselClient
                  block={block}
                  cardsPerView={block.postsPerPage}
                  className="mt-8"
                />
              ) : (
                <CategoryBlockClient block={block} />
              )
            ) : (
              <StaticBlockComponent block={block} isAdmin={false} />
            )}
          </div>
        );
      })}
    </div>
  );
}
