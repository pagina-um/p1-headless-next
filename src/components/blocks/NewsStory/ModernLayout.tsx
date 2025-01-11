import { EditableText } from "@/components/ui/EditableText";
import { CustomPostFields, ObjectPosition } from "@/types";
import { positionMap } from "@/utils/categoryUtils";
import { Maybe } from "graphql/jsutils/Maybe";
import { User, Calendar } from "lucide-react";
import { StoryLayoutProps } from "./ClassicLayout";
import { twMerge } from "tailwind-merge";

export function ModernStoryLayout({
  featuredImageUrl,
  featuredImageAlt,
  featuredImageSrcSet,
  postFields,
  title,
  author,
  date,
  isAdmin,
  blockUid,
  objectPosition,
  tags,
}: StoryLayoutProps) {
  const hasTagsToShow = tags.nodes.length > 0;
  return (
    <div className="relative h-full overflow-hidden  shadow-lg group">
      {featuredImageUrl && (
        <img
          src={featuredImageUrl || ""}
          srcSet={featuredImageSrcSet || undefined}
          alt={featuredImageAlt || ""}
          className={twMerge(
            "w-full h-full object-cover lg:group-hover:scale-105 transition-transform duration-300",
            positionMap[objectPosition]
          )}
        />
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

          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {author?.node.name}
            </span>
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(date).toLocaleDateString("pt-PT")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
