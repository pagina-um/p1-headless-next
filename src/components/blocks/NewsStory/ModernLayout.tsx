import { EditableText } from "@/components/ui/EditableText";
import { CustomPostFields, ObjectPosition } from "@/types";
import { positionMap } from "@/utils/categoryUtils";
import { Maybe } from "graphql/jsutils/Maybe";
import { User, Calendar } from "lucide-react";
import { StoryLayoutProps } from "./ClassicLayout";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

export function ModernStoryLayout({
  featuredImageUrl,
  featuredImageAlt,
  featuredImageSrcSet,
  postFields,
  title,
  isAdmin,
  blockUid,
  objectPosition,
  tags,
}: StoryLayoutProps) {
  const hasTagsToShow = tags.nodes.length > 0;
  return (
    <div className="relative h-full overflow-hidden  shadow-lg group">
      {featuredImageUrl && (
        <div className="relative w-full h-full">
          <Image
            src={featuredImageUrl}
            alt={featuredImageAlt || ""}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={twMerge(
              "object-cover lg:group-hover:scale-105 transition-transform duration-300",
              positionMap[objectPosition]
            )}
            quality={75}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        {!postFields.antetitulo && hasTagsToShow && (
          <div className="flex gap-2 text-balance text-gray-600 font-medium ">
            {tags.nodes.slice(0, 1).map((tag: any) => (
              <div
                className="bg-primary-dark text-white uppercase font-medium text-xs px-2 py-1 backdrop-opacity-25"
                key={tag.id}
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
        <div className="absolute bottom-0 p-6 text-white">
          {postFields.antetitulo && (
            <p>
              {!isAdmin ? (
                postFields.antetitulo
              ) : (
                <EditableText
                  blockUid={blockUid}
                  fieldName="antetitulo"
                  originalText={postFields.antetitulo}
                />
              )}
            </p>
          )}

          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
            {!isAdmin ? (
              title
            ) : (
              <EditableText
                blockUid={blockUid}
                fieldName="title"
                originalText={title}
              />
            )}
          </h2>

          {(postFields.chamadaDestaque || postFields.chamadaManchete) && (
            <p className={twMerge("text-gray-300 text-sm")}>
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
