"use client";

import { StoryBlock } from "@/types";
import { NewsStoryCommon } from "./NewsStoryCommon";
import { useEffect, useState } from "react";

interface NewsStoryProps {
  story: StoryBlock;
}

export function NewsStoryClient({ story }: NewsStoryProps) {
  const { postId } = story;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error("Failed to fetch post");
        const postData = await response.json();
        setData({ post: postData });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <NewsStoryCommon story={story} data={data} error={error} isAdmin={true} />
  );
}
