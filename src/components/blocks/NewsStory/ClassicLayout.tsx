import { EditableText } from "@/components/ui/EditableText";
import { CustomPostFields, ObjectPosition } from "@/types";
import { positionMap } from "@/utils/categoryUtils";
import { Maybe } from "graphql/jsutils/Maybe";
import { Square } from "lucide-react";
import { twMerge } from "tailwind-merge";

export const MIN_BLOCK_AREA_FOR_EXTRA_CONTENT = 12;

export function ClassicStoryLayout({
  blockSize,
  featuredImageUrl,
  featuredImageAlt,
  featuredImageSrcSet,
  postFields,
  title,
  author,
  date,
  isAdmin,
  blockUid,
  orientation,
  objectPosition,
}: {
  blockSize: [number, number];
  featuredImageUrl: string;
  featuredImageSrcSet?: Maybe<string>;
  featuredImageAlt: string;
  postFields: CustomPostFields;
  title: string;
  author: any;
  date: string;
  isAdmin: boolean;
  blockUid: string;
  orientation: "horizontal" | "vertical";
  objectPosition: ObjectPosition;
}) {
  const isLandscape = orientation === "horizontal";
  const displayImage = true;
  return (
    <div className="@container group h-full px-4 lg:px-0">
      <div
        className={`flex gap-4 h-full ${isLandscape ? "flex-row" : "flex-col"}`}
      >
        {featuredImageUrl && displayImage && (
          <div className={`relative ${isLandscape ? "w-1/2" : "h-full"}`}>
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
            <p className="flex items-center text-pretty text-gray-600 font-medium underline underline-offset-2 text-sm">
              <Square className="w-2 h-2 bg-primary stroke-primary inline mr-2" />
              {isAdmin ? (
                <EditableText
                  blockUid={blockUid}
                  originalText={postFields.antetitulo}
                  fieldName="antetitulo"
                />
              ) : (
                postFields.antetitulo
              )}
            </p>
          )}

          <h2
            className={twMerge(
              "font-serif text-2xl font-bold mb-3 leading-tight text-pretty",
              !isAdmin && "group-hover:underline"
            )}
          >
            {isAdmin ? (
              <EditableText
                blockUid={blockUid}
                originalText={title}
                fieldName="title"
              />
            ) : (
              title
            )}
          </h2>
          {postFields.chamadaDestaque && (
            <p className="text-gray-600 text-sm">
              {isAdmin ? (
                <EditableText
                  blockUid={blockUid}
                  originalText={postFields.chamadaDestaque}
                  fieldName="chamadaDestaque"
                />
              ) : (
                postFields.chamadaDestaque
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
