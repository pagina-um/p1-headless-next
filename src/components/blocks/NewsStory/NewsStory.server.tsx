import React from "react";

import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { StoryBlock } from "@/types";

import { NewsStoryCommon } from "./NewsStoryCommon";

interface NewsStoryProps {
  story: StoryBlock;
}

export async function NewsStoryServer({ story }: NewsStoryProps) {
  const { wpPostId } = story;

  const { data, error } = await getClient().query(GET_POST_BY_ID, {
    id: wpPostId.toString(),
  });

  return (
    <NewsStoryCommon story={story} data={data} error={error} isAdmin={false} />
  );
}
