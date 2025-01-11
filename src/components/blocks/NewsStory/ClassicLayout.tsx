import { customPostFields } from "@/types";
import { Maybe } from "graphql/jsutils/Maybe";
import { Square } from "lucide-react";

export const MIN_BLOCK_AREA_FOR_EXTRA_CONTENT = 12;
export interface StoryLayoutProps {
  blockSize: [number, number];
  featuredImageUrl: string;
  featuredImageSrcSet?: Maybe<string>;
  featuredImageAlt: string;
  postFields: customPostFields;
  title: string;
  author: any;
  date: string;
  tags: any;
}
export function ClassicStoryLayout({
  blockSize,
  featuredImageUrl,
  featuredImageAlt,
  featuredImageSrcSet,
  postFields,
  title,
  tags,
}: StoryLayoutProps) {
  const blockArea = blockSize[0] * blockSize[1] * 1.5;
  const isLargeBlock = blockArea >= MIN_BLOCK_AREA_FOR_EXTRA_CONTENT;
  const isLandscape = blockSize[0] > blockSize[1] * 0.9;
  const hasTagsToShow = tags.nodes.length > 0;
  return (
    <div className="@container group h-full ">
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
            <p className="text-balance text-gray-600 font-medium underline underline-offset-2">
              <Square className="w-2 h-2 bg-primary stroke-primary inline mr-2 mb-1" />
              {postFields.antetitulo}
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

          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:underline text-balance">
            {title}
          </h2>
          {postFields.chamadaDestaque && (
            <p className="text-gray-600">{postFields.chamadaDestaque}</p>
          )}
        </div>
      </div>
    </div>
  );
}
