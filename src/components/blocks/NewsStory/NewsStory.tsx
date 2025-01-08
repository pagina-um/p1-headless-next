import React from "react";
import { User, Calendar, Square } from "lucide-react";
import Link from "next/link";

import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { customPostFields, StoryBlock } from "@/types";
import { ModernStoryLayout } from "./ModernLayout";
import { ClassicStoryLayout } from "./ClassicLayout";

interface NewsStoryProps {
  story: StoryBlock;
}

export async function NewsStory({ story }: NewsStoryProps) {
  const { wpPostId } = story;

  const { data, error } = await getClient().query(GET_POST_BY_ID, {
    id: wpPostId.toString(),
  });

  if (!data?.post || error) {
    console.error(error, wpPostId);
    return "Conteúdo não encontrado.";
  }
  const {
    post: { author, featuredImage, uri, title, date, excerpt },
  } = data;

  const postFields: customPostFields = data.post
    ?.postFields as customPostFields;

  const storyStyle = story.style;
  return (
    <Link href={uri || ""} passHref>
      {storyStyle === "modern" ? (
        <ModernStoryLayout
          featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
          featuredImageAlt={featuredImage?.node?.altText || ""}
          featuredImageSrcSet={featuredImage?.node?.srcSet}
          postFields={postFields}
          title={title || ""}
          author={author}
          date={date || ""}
        />
      ) : (
        <ClassicStoryLayout
          blockSize={[story.gridPosition.width, story.gridPosition.height]}
          featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
          featuredImageAlt={featuredImage?.node?.altText || ""}
          featuredImageSrcSet={featuredImage?.node?.srcSet}
          postFields={postFields}
          title={title || ""}
          author={author}
          date={date || ""}
          isAdmin={false}
        />
      )}
    </Link>
  );
}
