import { EditableText } from "@/components/ui/EditableText";
import { CustomPostFields, ObjectPosition } from "@/types";
import { Maybe } from "graphql/jsutils/Maybe";
import { Square } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { positionMap } from "@/utils/categoryUtils";
import Image from "next/image";
import Link from "next/link";

export const MIN_BLOCK_AREA_FOR_EXTRA_CONTENT = 12;
export interface StoryLayoutProps {
  uri: string;
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
  expandImage: boolean;
  extraBigTitle: boolean;
  featuredImageWidth?: number;
  featuredImageHeight?: number;
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
  expandImage,
  extraBigTitle,
  blockSize,
  uri,
}: StoryLayoutProps) {
  const hasTagsToShow = tags.nodes.length > 0;
  const displayImage = !hideImage;
  const tagNames = tags.nodes
    .filter((tag: any) => !tag.name.includes("estaque"))
    .map((t: any) => t.name)
    .join(" • ");
  const isLandscape = orientation === "horizontal";
  const shouldReverse = reverse && isLandscape;
  return (
    <div className="@container group h-full px-4 lg:px-0">
      <div
        className={twMerge(
          "flex gap-x-4 lg:gap-y-1 h-full flex-col",
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
            className={twMerge(
              "relative min-h-36 max-md:w-full lg:min-h-0",
              isLandscape ? "w-1/2" : "h-full",
              !expandImage && !isLandscape && "lg:flex-1"
            )}
          >
            {/* Pre-title or tags overlay on top of the featured image */}
            {(postFields.antetitulo || hasTagsToShow) && (
              <div
                className={twMerge(
                  "absolute z-20 hidden lg:block",
                  shouldReverse && "lg:right-4 lg:left-auto lg:text-right",
                  isLandscape ? "" : "lg:top-auto lg:bottom-0"
                )}
              >
                <div
                  className={twMerge(
                    "bg-primary-dark text-white uppercase font-medium text-sm tracking-wide px-2 py-0.5 border-white backdrop-blur-sm w-fit",
                    shouldReverse && "lg:text-right"
                  )}
                >
                  {postFields.antetitulo ? (
                    isAdmin ? (
                      <EditableText
                        blockUid={blockUid}
                        originalText={postFields.antetitulo}
                        fieldName="antetitulo"
                        textAlign={shouldReverse ? "right" : "left"}
                      />
                    ) : (
                      postFields.antetitulo
                    )
                  ) : (
                    <span>{tagNames}</span>
                  )}
                </div>
              </div>
            )}
            <div
              className="absolute inset-0 bg-gray-300 animate-pulse"
              id={`skeleton-${blockUid}`}
            ></div>

            <Link href={uri}>
              <Image
                src={featuredImageUrl}
                alt={featuredImageAlt || ""}
                fill
                sizes={getSizesFromBlockArea(blockSize[0] * blockSize[1])}
                className={twMerge("object-cover")}
                style={{ objectPosition: positionMap[objectPosition] }}
                quality={85}
              />
            </Link>
          </div>
        )}
        {/* Pre-title or tags overlay on top of the featured image */}
        {(postFields.antetitulo || hasTagsToShow) && (
          <div
            className={twMerge(
              "md:hidden",
              shouldReverse && "lg:right-4 lg:left-auto lg:text-right",
              isLandscape ? "" : "lg:top-auto lg:bottom-0"
            )}
          >
            <div
              className={twMerge(
                "bg-[rgb(146,10,10)] text-white uppercase font-medium text-sm tracking-wide px-2 py-0.5 border-white backdrop-blur-sm lg:w-fit",
                shouldReverse && "lg:text-right"
              )}
            >
              {postFields.antetitulo ? (
                isAdmin ? (
                  <EditableText
                    blockUid={blockUid}
                    originalText={postFields.antetitulo}
                    fieldName="antetitulo"
                    textAlign={shouldReverse ? "right" : "left"}
                  />
                ) : (
                  postFields.antetitulo
                )
              ) : (
                <span>{tagNames}</span>
              )}
            </div>
          </div>
        )}

        <div className="lg:flex-1 flex flex-col justify-start max-lg:border-b-2 max-lg:pb-4">
          {/* If there's no featured image, render the pre-title / tags in the text column (keeps previous behaviour) */}
          {!displayImage && postFields.antetitulo && (
            <p
              className={twMerge(
                "bg-[rgba(0,0,0,0.06)] w-fit pr-2 border items-start text-pretty text-primary-dark font-medium text-sm gap-x-1 before:content-[''] before:block before:w-1 before:h-full before:bg-primary-dark before:flex-shrink-0",
                shouldReverse && "lg:flex-row-reverse lg:text-right"
              )}
            >
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
          {!displayImage && !postFields.antetitulo && hasTagsToShow && (
            <div
              className={twMerge(
                "flex gap-2 text-balance text-gray-600 font-medium underline-offset-2",
                shouldReverse && "lg:flex-row-reverse"
              )}
            >
              {tags.nodes
                .filter((tag: any) => !tag.name.includes("estaque"))
                .map((tag: any) => (
                  <div
                    className="bg-primary-dark text-white uppercase font-medium text-xs px-2 py-1"
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
              !isAdmin && "lg:group-hover:underline",
              shouldReverse && "lg:text-right",
              extraBigTitle && "text-3xl"
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
              <Link href={uri}>{title}</Link>
            )}
          </h2>
          {(postFields.chamadaDestaque || postFields.chamadaManchete) && (
            <p
              className={twMerge(
                "text-gray-600 md:text-sm",
                shouldReverse && "lg:text-right",
                !isAdmin && "select-text"
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

export function getSizesFromBlockArea(blockArea: number) {
  // For very large blocks, use full viewport width on mobile
  if (blockArea >= 40) {
    return "(max-width: 768px) 100vw, 50vw";
  }
  // For medium blocks, use 80vw on mobile
  else if (blockArea >= 20) {
    return "(max-width: 768px) 80vw, 33vw";
  }
  // For smaller blocks, still maintain good quality on mobile
  else if (blockArea >= 12) {
    return "(max-width: 768px) 60vw, 33vw";
  }
  // For the smallest blocks
  else {
    return "(max-width: 768px) 50vw, 25vw";
  }
}
