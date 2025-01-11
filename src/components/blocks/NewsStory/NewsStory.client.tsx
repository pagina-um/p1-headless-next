"use client";

import { GET_POST_BY_ID } from "@/services/wp-graphql";
import { customPostFields, StoryBlock } from "@/types";
import { useQuery } from "@urql/next";
import { User, Calendar, FileWarningIcon } from "lucide-react";
import Link from "next/link";
import { ModernStoryLayout } from "./ModernLayout";
import { ClassicStoryLayout } from "./ClassicLayout";

interface NewsStoryProps {
  story: StoryBlock;
}

export function NewsStoryClient({ story }: NewsStoryProps) {
  const { wpPostId } = story;

  const [{ data, error }] = useQuery({
    query: GET_POST_BY_ID,
    variables: { id: wpPostId.toString() },
  });

  if (!data?.post || error) {
    console.error(error, wpPostId);
    return (
      <div className="h-full flex items-center justify-center text-center flex-col text-gray-400 text-sm gap-1">
        <FileWarningIcon className="w-6 h-6 " />
        Conteúdo não encontrado.
      </div>
    );
  }
  const {
    post: { author, featuredImage, uri, title, date, categories, tags },
  } = data;

  const postFields: customPostFields = data.post
    ?.postFields as customPostFields;

  return story.style === "modern" ? (
    <ModernStoryLayout
      featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
      featuredImageAlt={featuredImage?.node?.altText || ""}
      featuredImageSrcSet={featuredImage?.node?.srcSet}
      postFields={postFields}
      title={title || ""}
      author={author}
      date={date || ""}
      tags={tags}
      blockSize={[story.gridPosition.width, story.gridPosition.height]}
    />
  ) : (
    <ClassicStoryLayout
      blockSize={[story.gridPosition.width, story.gridPosition.height]}
      featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
      featuredImageSrcSet={featuredImage?.node?.srcSet}
      featuredImageAlt={featuredImage?.node?.altText || ""}
      postFields={postFields}
      title={title || ""}
      author={author}
      date={date || ""}
      tags={tags}
    />
  );
}
