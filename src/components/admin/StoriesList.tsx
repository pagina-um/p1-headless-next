import React from "react";
import { WPPostsList } from "./WPPostsList";
import { useQuery } from "@urql/next";
import { GET_LATEST_POSTS } from "@/services/experiment";
import { StoryBlock } from "@/types";

interface StoriesListProps {
  onSelectPost: (wpPostId: number) => void;
}

export function StoriesList({ onSelectPost }: StoriesListProps) {
  const [result] = useQuery({ query: GET_LATEST_POSTS });
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Notícias</h2>
      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
        <WPPostsList
          posts={result.data?.posts || []}
          onSelectPost={onSelectPost}
        />
      </div>
    </div>
  );
}
