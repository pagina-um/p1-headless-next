import React from "react";

import { getPostById } from "@/services/payload-api";
import { StoryBlock } from "@/types";

import { NewsStoryCommon } from "./NewsStoryCommon";

interface NewsStoryProps {
  story: StoryBlock;
}

export async function NewsStoryServer({ story }: NewsStoryProps) {
  const { databaseId } = story;

  const { data, error } = await getPostById(databaseId.toString());

  return (
    <NewsStoryCommon story={story} data={data} error={error} isAdmin={false} />
  );
}
