import React from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { StoryBlock, PayloadPost } from "@/types";
import { NewsStoryCommon } from "./NewsStoryCommon";

interface NewsStoryProps {
  story: StoryBlock;
}

export async function NewsStoryServer({ story }: NewsStoryProps) {
  const { databaseId, postId } = story;
  const payload = await getPayload({ config });

  let post: PayloadPost | null = null;
  let error: string | null = null;

  try {
    // Try by Payload ID first (postId), then by wpDatabaseId
    if (postId) {
      const doc = await payload.findByID({
        collection: "posts",
        id: postId,
        depth: 2,
      });
      post = doc as PayloadPost;
    } else if (databaseId) {
      const result = await payload.find({
        collection: "posts",
        where: {
          wpDatabaseId: { equals: databaseId },
        },
        limit: 1,
        depth: 2,
      });
      post = (result.docs[0] as PayloadPost) || null;
    }
  } catch (e: any) {
    error = e.message;
  }

  return (
    <NewsStoryCommon story={story} post={post} error={error} isAdmin={false} />
  );
}
