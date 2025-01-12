import { EditableText } from "@/components/ui/EditableText";
import { CustomPostFields, ObjectPosition } from "@/types";
import { Maybe } from "graphql/jsutils/Maybe";
import { Square } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { positionMap } from "@/utils/categoryUtils";

export const MIN_BLOCK_AREA_FOR_EXTRA_CONTENT = 12;
export interface StoryLayoutProps {
  blockSize: [number, number];
  featuredImageUrl: string;
  featuredImageSrcSet?: Maybe<string>;
  featuredImageAlt: string;
  postFields: CustomPostFields;
  title: string;
  author: any;
  date: string;
  tags: any;
  orientation: "horizontal" | "vertical";
  objectPosition: ObjectPosition;
  isAdmin: boolean;
  blockUid: string;
  reverse?: boolean;
  hideImage?: boolean;
}

export function ClassicStoryLayout({
  featuredImageUrl,
  featuredImageAlt,
  featuredImageSrcSet,
  postFields,
  title,
  tags,
  orientation,
  isAdmin,
  blockUid,
  objectPosition,
  hideImage,
  reverse,
}: StoryLayoutProps) {
  const hasTagsToShow = tags.nodes.length > 0;
  const displayImage = !hideImage;
  const isLandscape = orientation === "horizontal";
  const shouldReverse = reverse && isLandscape;
  return (
    <div className="@container group h-full px-4 lg:px-0">
      <div
        className={twMerge(
          "flex gap-4 h-full flex-col",
          isLandscape
            ? reverse
              ? "lg:flex-row-reverse"
              : "lg:flex-row"
            : reverse
            ? "lg:flex-col-reverse"
            : "lg:flex-col"
        )}
      >
        {featuredImageUrl && displayImage && (
          <div
            className={`relative ${
              isLandscape ? "w-1/2" : "h-full"
            } max-md:min-h-36`}
          >
            <img
              src={featuredImageUrl || ""}
              srcSet={featuredImageSrcSet || undefined}
              alt={featuredImageAlt || ""}
              className={twMerge(
                "object-cover w-full h-full absolute inset-0",
                positionMap[objectPosition]
              )}
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-center">
          {postFields.antetitulo && (
            <p
              className={twMerge(
                "flex items-start text-pretty text-gray-600 font-medium underline underline-offset-2 text-sm  gap-x-1",
                shouldReverse && "flex-row-reverse"
              )}
            >
              <Square className="w-2 h-2 bg-primary stroke-primary inline mt-1.5" />
              {isAdmin ? (
                <EditableText
                  blockUid={blockUid}
                  originalText={postFields.antetitulo}
                  fieldName="antetitulo"
                  textAlign={shouldReverse ? "right" : "left"}
                />
              ) : (
                postFields.antetitulo
              )}
            </p>
          )}
          {!postFields.antetitulo && hasTagsToShow && (
            <div className="flex gap-2 text-balance text-gray-600 font-medium underline-offset-2">
              {tags.nodes.map((tag: any) => (
                <div
                  className="bg-slate-400 text-white uppercase font-medium text-xs px-2 py-1"
                  key={tag.id}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          )}

          <h2
            className={twMerge(
              "font-serif text-2xl font-bold mb-3 leading-tight text-pretty",
              !isAdmin && "group-hover:underline",
              shouldReverse && "text-right"
            )}
          >
            {isAdmin ? (
              <EditableText
                blockUid={blockUid}
                originalText={title}
                fieldName="title"
                textAlign={shouldReverse ? "right" : "left"}
              />
            ) : (
              title
            )}
          </h2>
          {(postFields.chamadaDestaque || postFields.chamadaManchete) && (
            <p
              className={twMerge(
                "text-gray-600 text-sm",
                shouldReverse && "text-right"
              )}
            >
              {isAdmin ? (
                <EditableText
                  blockUid={blockUid}
                  originalText={
                    (postFields.chamadaDestaque ||
                      postFields.chamadaManchete) as string
                  }
                  fieldName={
                    postFields.chamadaDestaque
                      ? "chamadaDestaque"
                      : "chamadaManchete"
                  }
                  textAlign={shouldReverse ? "right" : "left"}
                />
              ) : (
                postFields.chamadaDestaque || postFields.chamadaManchete
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
