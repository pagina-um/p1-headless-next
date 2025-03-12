import React from "react";
import { WPPostsList } from "./WPPostsList";
import { useQuery } from "@urql/next";
import { GET_LATEST_POSTS } from "@/services/wp-graphql";
import { StoryBlock } from "@/types";

interface StoriesListProps {
  onSelectPost: (databaseId: number, postId: string) => void;
}

export function StoriesList({ onSelectPost }: StoriesListProps) {
  const [result] = useQuery({
    query: GET_LATEST_POSTS,
    requestPolicy: "network-only",
  });
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Blocos individuais</h2>
      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
        <WPPostsList
          posts={(result.data?.posts as any) || []}
          onSelectPost={onSelectPost}
        />
      </div>
    </div>
  );
}
