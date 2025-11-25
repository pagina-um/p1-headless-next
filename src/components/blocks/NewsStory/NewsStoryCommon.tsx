import { StoryBlock } from "@/types";
import { extractStoryData } from "@/utils/categoryUtils";
import { FileWarningIcon } from "lucide-react";
import { ClassicStoryLayout } from "./ClassicLayout";
import { ModernStoryLayout } from "./ModernLayout";
import Link from "next/link";

// Payload API post data type
type PayloadPostData = {
  post: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    slug: string;
    uri: string;
    postFields?: {
      antetitulo?: string | null;
      chamadaDestaque?: string | null;
      chamadaManchete?: string | null;
    };
    categories?: {
      nodes: Array<{ id: string; name: string }>;
    };
    tags?: {
      nodes: Array<{ id: string; name: string }>;
    };
    author?: {
      node?: {
        name: string;
        avatar?: { url: string };
      };
    };
    featuredImage?: {
      node?: {
        sourceUrl: string;
        altText: string;
        srcSet?: string;
        mediaDetails?: {
          height: number;
          width: number;
        };
      };
    } | null;
  };
};

export function NewsStoryCommon({
  story,
  data,
  error,
  isAdmin,
}: {
  story: StoryBlock;
  data: PayloadPostData | null | undefined;
  error: any;
  isAdmin: boolean;
}) {
  if (!data?.post || error) {
    console.error(error);
    return (
      <div className="h-full flex items-center justify-center text-center flex-col text-gray-400 text-sm gap-1">
        <FileWarningIcon className="w-6 h-6 " />
        Conteúdo não encontrado.
      </div>
    );
  }
  const { finalTitle, overridePostFields, author, date, uri } =
    extractStoryData(data, story);

  const featuredImage = data.post?.featuredImage;
  return (
    <ConditionalLinkWrapper href={isAdmin ? undefined : uri}>
      {story.style === "modern" ? (
        <ModernStoryLayout
          uri={uri}
          featuredImageWidth={featuredImage?.node?.mediaDetails?.width || 0}
          featuredImageHeight={featuredImage?.node?.mediaDetails?.height || 0}
          featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
          featuredImageAlt={featuredImage?.node?.altText || ""}
          featuredImageSrcSet={featuredImage?.node?.srcSet}
          postFields={overridePostFields}
          title={finalTitle || ""}
          author={author}
          date={date || ""}
          blockUid={story.uId}
          isAdmin={isAdmin}
          objectPosition={story.objectPosition}
          tags={data.post.tags}
          blockSize={[story.gridPosition.width, story.gridPosition.height]}
          orientation="vertical"
          expandImage={false}
          extraBigTitle={false}
        />
      ) : (
        <ClassicStoryLayout
          uri={uri}
          blockSize={[story.gridPosition.width, story.gridPosition.height]}
          featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
          featuredImageSrcSet={featuredImage?.node?.srcSet}
          featuredImageAlt={featuredImage?.node?.altText || ""}
          postFields={overridePostFields}
          title={finalTitle || ""}
          author={author}
          date={date || ""}
          blockUid={story.uId}
          isAdmin={isAdmin}
          orientation={story.orientation}
          objectPosition={story.objectPosition}
          tags={data.post.tags}
          categories={data.post.categories}
          antetituloColor={story.antetituloColor}
          hideImage={story.hideImage}
          reverse={story.reverse}
          expandImage={story.expandImage}
          extraBigTitle={story.extraBigTitle}
        />
      )}
    </ConditionalLinkWrapper>
  );
}

function ConditionalLinkWrapper({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  // return href ? <Link href={href}>{children}</Link> : <>{children}</>;
  return <>{children}</>;
}
