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
  const isLandscape = orientation === "horizontal";
  const shouldReverse = reverse && isLandscape;
  return (
    <div className="@container group h-full px-4 lg:px-0 ">
      <div
        className={twMerge(
          "flex gap-x-4 gap-y-1 h-full flex-col",
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
              "relative max-md:min-h-36 max-md:w-full",
              isLandscape ? "w-1/2" : "h-full",
              !expandImage && !isLandscape && "lg:flex-1"
            )}
          >
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

            {/* Overlay pre-title content on image */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Subtle gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 right-3 pointer-events-auto">
                {postFields.antetitulo && (
                  <div
                    className={twMerge(
                      "hidden lg:block",
                      shouldReverse && "lg:flex lg:justify-end"
                    )}
                  >
                    <p
                      className={twMerge(
                        "relative flex w-fit items-start text-balance font-semibold text-sm gap-x-1.5",
                        "bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-md",
                        "border border-white/20 rounded-sm px-2 py-1",
                        "shadow-lg shadow-black/10",
                        "text-primary-dark/90",
                        shouldReverse && "lg:flex-row-reverse lg:text-right"
                      )}
                    >
                      <span className="relative z-10 leading-relaxed">
                        {isAdmin ? (
                          <EditableText
                            blockUid={blockUid}
                            originalText={postFields.antetitulo}
                            fieldName="antetitulo"
                            textAlign={shouldReverse ? "right" : "left"}
                          />
                        ) : (
                          (() => {
                            const colonIndex =
                              postFields.antetitulo.indexOf(":");
                            if (colonIndex !== -1) {
                              const beforeColon =
                                postFields.antetitulo.substring(
                                  0,
                                  colonIndex + 1
                                );
                              const afterColon =
                                postFields.antetitulo.substring(colonIndex + 1);
                              return (
                                <>
                                  <span className="text-primary-dark font-bold">
                                    {beforeColon}
                                  </span>
                                  {afterColon}
                                </>
                              );
                            }
                            return postFields.antetitulo;
                          })()
                        )}
                      </span>
                    </p>
                  </div>
                )}
                {!postFields.antetitulo && hasTagsToShow && (
                  <div
                    className={twMerge(
                      "hidden lg:flex gap-2.5 flex-wrap",
                      shouldReverse && "lg:flex-row-reverse lg:justify-end"
                    )}
                  >
                    {tags.nodes
                      .filter((tag: any) => !tag.name.includes("estaque"))
                      .map((tag: any) => (
                        <div
                          className={twMerge(
                            "relative overflow-hidden",
                            "bg-gradient-to-r from-primary-dark via-primary-dark to-primary-dark/90",
                            "backdrop-blur-md border border-primary-dark/20",
                            "text-white uppercase font-bold text-xs tracking-wider",
                            "px-3 py-1.5 rounded-full shadow-lg shadow-primary-dark/25"
                          )}
                          key={tag.id}
                        >
                          <span className="relative z-10">{tag.name}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="lg:flex-1 flex flex-col justify-start max-lg:border-b-2 max-lg:pb-4">
          {/* Show pre-title content here when there's no image, or on smaller screens when there is an image */}
          {(!displayImage || (displayImage && featuredImageUrl)) &&
            postFields.antetitulo && (
              <p
                className={twMerge(
                  "bg-opacity-50 flex bg-white w-fit pr-2 border items-start text-pretty text-primary-dark font-medium underline-offset-2 text-sm gap-x-1 before:content-[''] before:block before:w-1 before:h-full before:bg-primary-dark before:flex-shrink-0",
                  shouldReverse && "lg:flex-row-reverse lg:text-right",
                  displayImage && featuredImageUrl && "lg:hidden" // Hide on lg+ when image is present
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
                  (() => {
                    const colonIndex = postFields.antetitulo.indexOf(":");
                    if (colonIndex !== -1) {
                      const beforeColon = postFields.antetitulo.substring(
                        0,
                        colonIndex + 1
                      );
                      const afterColon = postFields.antetitulo.substring(
                        colonIndex + 1
                      );
                      return (
                        <>
                          <span className="text-primary-dark font-bold">
                            {beforeColon}
                          </span>
                          {afterColon}
                        </>
                      );
                    }
                    return postFields.antetitulo;
                  })()
                )}
              </p>
            )}
          {(!displayImage || (displayImage && featuredImageUrl)) &&
            !postFields.antetitulo &&
            hasTagsToShow && (
              <div
                className={twMerge(
                  "flex gap-2 text-balance text-gray-600 font-medium underline-offset-2",
                  shouldReverse && "lg:flex-row-reverse",
                  displayImage && featuredImageUrl && "lg:hidden" // Hide on lg+ when image is present
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
                "text-gray-600 text-[15px]",
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
