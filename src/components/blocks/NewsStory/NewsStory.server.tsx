import React from "react";

import { StoryPost } from "@/services/wp-graphql";
import { StoryBlock } from "@/types";

import { NewsStoryCommon } from "./NewsStoryCommon";

interface NewsStoryProps {
  story: StoryBlock;
  /**
   * Resolved by NewsGrid in a single batched query for the whole page.
   * Undefined only when the post genuinely no longer exists — transport and
   * GraphQL errors throw upstream so a failed render is never cached.
   */
  post: StoryPost | undefined;
}

export function NewsStoryServer({ story, post }: NewsStoryProps) {
  return (
    <NewsStoryCommon
      story={story}
      data={post ? { post } : undefined}
      error={undefined}
      isAdmin={false}
    />
  );
}
