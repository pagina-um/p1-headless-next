"use client";

import { GET_POST_BY_ID } from "@/services/wp-graphql";
import { StoryBlock } from "@/types";
import { useQuery } from "@urql/next";
import { NewsStoryCommon } from "./NewsStoryCommon";

interface NewsStoryProps {
  story: StoryBlock;
}

export function NewsStoryClient({ story }: NewsStoryProps) {
  const { databaseId } = story;

  const [{ data, error }] = useQuery({
    query: GET_POST_BY_ID,
    variables: { id: databaseId.toString() },
  });
  return (
    <NewsStoryCommon story={story} data={data} error={error} isAdmin={true} />
  );
}
