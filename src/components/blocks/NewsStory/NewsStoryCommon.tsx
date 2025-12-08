import { StoryBlock, PayloadPost, getPostImageUrl, getPostImageAlt, PayloadCategory, PayloadTag } from "@/types";
import { or } from "@/utils/categoryUtils";
import { FileWarningIcon } from "lucide-react";
import { ClassicStoryLayout } from "./ClassicLayout";
import { ModernStoryLayout } from "./ModernLayout";
import Link from "next/link";

export function NewsStoryCommon({
  story,
  post,
  error,
  isAdmin,
}: {
  story: StoryBlock;
  post: PayloadPost | null | undefined;
  error: any;
  isAdmin: boolean;
}) {
  if (!post || error) {
    console.error(error);
    return (
      <div className="h-full flex items-center justify-center text-center flex-col text-gray-400 text-sm gap-1">
        <FileWarningIcon className="w-6 h-6 " />
        Conteúdo não encontrado.
      </div>
    );
  }

  // Extract and merge story overrides with post data
  const {
    title: overrideTitle,
    chamadaDestaque: overrideChamadaDestaque,
    chamadaManchete: overrideChamadaManchete,
    antetitulo: overrideAntetitulo,
  } = story;

  const overridePostFields = {
    antetitulo: or(overrideAntetitulo, post.antetitulo),
    chamadaDestaque: or(overrideChamadaDestaque, post.chamadaDestaque),
    chamadaManchete: or(overrideChamadaManchete, post.chamadaManchete),
  };

  const finalTitle = or(overrideTitle, post.title);
  const uri = post.uri || "#";
  const date = post.publishedAt || "";
  const author = typeof post.author === "object" ? post.author : null;

  // Get featured image
  const featuredImageUrl = getPostImageUrl(post) || "";
  const featuredImageAlt = getPostImageAlt(post);

  // Get image dimensions from media if available
  const featuredImage = typeof post.featuredImage === "object" ? post.featuredImage : null;
  const imageWidth = featuredImage?.width || 0;
  const imageHeight = featuredImage?.height || 0;

  // Format categories and tags for layouts (they expect the old structure)
  const categories = (post.categories || [])
    .filter((c): c is PayloadCategory => typeof c === "object")
    .map(c => ({ id: String(c.id), name: c.name }));

  const tags = (post.tags || [])
    .filter((t): t is PayloadTag => typeof t === "object")
    .map(t => ({ id: String(t.id), name: t.name }));

  // Format for legacy layout components
  const categoriesForLayout = { nodes: categories };
  const tagsForLayout = { nodes: tags };

  return (
    <ConditionalLinkWrapper href={isAdmin ? undefined : uri}>
      {story.style === "modern" ? (
        <ModernStoryLayout
          uri={uri}
          featuredImageWidth={imageWidth}
          featuredImageHeight={imageHeight}
          featuredImageUrl={featuredImageUrl}
          featuredImageAlt={featuredImageAlt}
          featuredImageSrcSet={undefined}
          postFields={overridePostFields}
          title={finalTitle || ""}
          author={author}
          date={date}
          blockUid={story.uId}
          isAdmin={isAdmin}
          objectPosition={story.objectPosition}
          tags={tagsForLayout}
          blockSize={[story.gridPosition.width, story.gridPosition.height]}
          orientation="vertical"
          expandImage={false}
          extraBigTitle={false}
        />
      ) : (
        <ClassicStoryLayout
          uri={uri}
          blockSize={[story.gridPosition.width, story.gridPosition.height]}
          featuredImageUrl={featuredImageUrl}
          featuredImageSrcSet={undefined}
          featuredImageAlt={featuredImageAlt}
          postFields={overridePostFields}
          title={finalTitle || ""}
          author={author}
          date={date}
          blockUid={story.uId}
          isAdmin={isAdmin}
          orientation={story.orientation}
          objectPosition={story.objectPosition}
          tags={tagsForLayout}
          categories={categoriesForLayout}
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
  return <>{children}</>;
}
