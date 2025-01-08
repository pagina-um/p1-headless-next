import { StoryBlock } from "@/types";
import { extractStoryData } from "@/utils/categoryUtils";
import { FileWarningIcon } from "lucide-react";
import { ClassicStoryLayout } from "./ClassicLayout";
import { ModernStoryLayout } from "./ModernLayout";
import { GET_POST_BY_ID } from "@/services/wp-graphql";
import { ResultOf } from "gql.tada";

export function NewsStoryCommon({
  story,
  data,
  error,
}: {
  story: StoryBlock;
  data: ResultOf<typeof GET_POST_BY_ID> | undefined;
  error: any;
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
  const { finalTitle, featuredImage, overridePostFields, author, date } =
    extractStoryData(data, story);

  return story.style === "modern" ? (
    <ModernStoryLayout
      featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
      featuredImageAlt={featuredImage?.node?.altText || ""}
      featuredImageSrcSet={featuredImage?.node?.srcSet}
      postFields={overridePostFields}
      title={finalTitle || ""}
      author={author}
      date={date || ""}
    />
  ) : (
    <ClassicStoryLayout
      blockSize={[story.gridPosition.width, story.gridPosition.height]}
      featuredImageUrl={featuredImage?.node?.sourceUrl || ""}
      featuredImageSrcSet={featuredImage?.node?.srcSet}
      featuredImageAlt={featuredImage?.node?.altText || ""}
      postFields={overridePostFields}
      title={finalTitle || ""}
      author={author}
      date={date || ""}
      isAdmin={true}
      blockUid={story.uId}
    />
  );
}
