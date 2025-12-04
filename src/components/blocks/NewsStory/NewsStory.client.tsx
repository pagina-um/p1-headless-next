"use client";

import { StoryBlock, PayloadPost } from "@/types";
import { NewsStoryCommon } from "./NewsStoryCommon";
import { useEffect, useState } from "react";
import { getPost } from "@/app/(payload)/admin/grid-editor/actions";

interface NewsStoryProps {
  story: StoryBlock;
}

export function NewsStoryClient({ story }: NewsStoryProps) {
  const { postId } = story;
  const [post, setPost] = useState<PayloadPost | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const postData = await getPost(postId);
        setPost(postData as PayloadPost);
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
    <NewsStoryCommon story={story} post={post} error={error} isAdmin={true} />
  );
}
