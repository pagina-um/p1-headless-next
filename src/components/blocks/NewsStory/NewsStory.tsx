import React from "react";
import { User, Calendar, Square } from "lucide-react";
import Link from "next/link";

import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { CustomPostFields, StoryBlock } from "@/types";
import { ModernStoryLayout } from "./ModernLayout";
import { ClassicStoryLayout } from "./ClassicLayout";

interface NewsStoryProps {
  story: StoryBlock;
}

export async function NewsStory({ story }: NewsStoryProps) {
  const {
    wpPostId,
    title: overrideTitle,
    chamadaDestaque: overrideChamadaDestaque,
    chamadaManchete: overrideChamadaManchete,
    antetitulo: overrideAntetitulo,
  } = story;

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

  const postFields: CustomPostFields = data.post
    ?.postFields as CustomPostFields;

  const overridePostFields = {
    antetitulo: overrideAntetitulo || postFields.antetitulo,
    chamadaDestaque: overrideChamadaDestaque || postFields.chamadaDestaque,
    chamadaManchete: overrideChamadaManchete || postFields.chamadaManchete,
  };

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
          postFields={overridePostFields}
          title={overrideTitle || title || ""}
          author={author}
          date={date || ""}
          isAdmin={false}
          blockUid={story.uId}
        />
      )}
    </Link>
  );
}
