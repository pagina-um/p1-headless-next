import { EditableText } from "@/components/ui/EditableText";
import { CustomPostFields } from "@/types";
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
}) {
  const blockArea = blockSize[0] * blockSize[1] * 1.5;
  const isLargeBlock = blockArea >= MIN_BLOCK_AREA_FOR_EXTRA_CONTENT;
  const isLandscape = blockSize[0] > blockSize[1] * 0.9;
  return (
    <div className="@container group h-full px-4">
      <div
        className={`flex gap-4 h-full ${isLandscape ? "flex-row" : "flex-col"}`}
      >
        {featuredImageUrl && isLargeBlock && (
          <div className={`relative ${isLandscape ? "w-1/2" : "h-1/2"}`}>
            <img
              src={featuredImageUrl || ""}
              srcSet={featuredImageSrcSet || undefined}
              alt={featuredImageAlt || ""}
              className="object-cover w-full h-full absolute inset-0"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-center">
          {postFields.antetitulo && (
            <p className="text-balance text-gray-600 font-medium underline underline-offset-2 text-sm">
              <Square className="w-2 h-2 bg-primary stroke-primary inline mr-2 mb-1" />
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
              "font-serif text-2xl font-bold mb-3 leading-tight text-balance",
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
