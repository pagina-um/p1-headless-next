import { Block, StoryBlock } from "@/types";
import { NewsStoryServer } from "../blocks/NewsStory/NewsStory.server";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { CulturaBannerServer } from "../blocks/CulturaBanner.server";
import { EmptyState } from "../ui/EmptyState";
import { CategoryBlockServer } from "../blocks/CategoryBlock.server";
import { sortBlocksZigzagThenMobilePriority } from "@/utils/sorting";
import { twMerge } from "tailwind-merge";
import { CategoryCarouselServer } from "../ui/CategoryCarousel.server";
import { getStoryPostsIds } from "@/utils/categoryUtils";
import {
  GET_POSTS_BY_IDS,
  getClient,
  StoryPost,
} from "@/services/wp-graphql";

interface NewsGridProps {
  blocks: Block[];
}

// WPGraphQL caps connection queries at 100 nodes. Chunking keeps an oversized
// grid honest instead of silently dropping blocks past the cap.
const MAX_POSTS_PER_QUERY = 100;

/**
 * Resolve every story block on the page in one round trip (per 100 blocks),
 * keyed by databaseId. Querying per block used to fan ~40 concurrent requests at
 * WordPress on every render, exhausting its DB connections — it then answered
 * with an HTML error page under a 200 status, which surfaced as a grid full of
 * "Conteúdo não encontrado".
 */
async function fetchStoryPosts(
  blocks: Block[]
): Promise<Map<number, StoryPost>> {
  const ids = Array.from(
    new Set(
      blocks
        .filter((block): block is StoryBlock => block.blockType === "story")
        .map((block) => block.databaseId)
        .filter((databaseId) => databaseId != null)
    )
  );

  if (ids.length === 0) {
    return new Map();
  }

  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += MAX_POSTS_PER_QUERY) {
    chunks.push(ids.slice(i, i + MAX_POSTS_PER_QUERY));
  }

  const nodes = (
    await Promise.all(
      chunks.map(async (chunk) => {
        const { data, error } = await getClient().query(GET_POSTS_BY_IDS, {
          ids: chunk.map(String),
          first: chunk.length,
        });

        // Throw instead of degrading to placeholders. A swallowed error renders a
        // page full of "Conteúdo não encontrado" that Next.js caches as a valid
        // render and serves until the next manual purge; throwing keeps the last
        // good page in cache.
        if (error) {
          throw new Error(
            `Failed to load story posts for grid: ${error.message}`,
            { cause: error }
          );
        }

        return data?.posts?.nodes ?? [];
      })
    )
  ).flat();

  return new Map(
    nodes
      .filter((node): node is StoryPost => node?.databaseId != null)
      .map((node) => [node.databaseId, node])
  );
}

export async function NewsGrid({ blocks = [] }: NewsGridProps) {
  const hasContent = blocks?.length > 0;

  if (!hasContent) {
    return <EmptyState message="No content has been added to the grid yet." />;
  }

  const sortedBlocks = sortBlocksZigzagThenMobilePriority(blocks, 6);
  const storyPostsIds = getStoryPostsIds(sortedBlocks);
  const storyPosts = await fetchStoryPosts(sortedBlocks);

  return (
    <div className="layout grid grid-cols-1 lg:grid-cols-10 gap-4 lg:mt-4 lg:mx-4">
      {sortedBlocks.map((block, i) => {
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
              `lg:row-span-${block.gridPosition.height}`,
              i === 0 && "max-md:mt-4"
            )}
          >
            {block.blockType === "story" ? (
              <NewsStoryServer
                story={block}
                post={storyPosts.get(block.databaseId)}
              />
            ) : block.blockType === "category" ? (
              isLandscape ? (
                <CategoryCarouselServer
                  block={block}
                  cardsPerView={block.postsPerPage} // Optional: number of cards visible at once
                  excludePostIds={storyPostsIds}
                />
              ) : (
                <CategoryBlockServer
                  block={block}
                  excludePostIds={storyPostsIds}
                />
              )
            ) : block.blockType === "static" && block.type === "culturaBanner" ? (
              <CulturaBannerServer block={block} />
            ) : (
              <StaticBlockComponent block={block} isAdmin={false} />
            )}
          </div>
        );
      })}
    </div>
  );
}
