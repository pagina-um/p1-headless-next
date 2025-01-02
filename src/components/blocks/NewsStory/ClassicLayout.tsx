import { customPostFields } from "@/types";
import { Square } from "lucide-react";

export const MIN_BLOCK_AREA_FOR_EXTRA_CONTENT = 6;

export function ClassicStoryLayout({
  blockSize,
  featuredImageUrl,
  featuredImageAlt,
  postFields,
  title,
  author,
  date,
}: {
  blockSize: [number, number];
  featuredImageUrl: string;
  featuredImageAlt: string;
  postFields: customPostFields;
  title: string;
  author: any;
  date: string;
}) {
  const blockArea = blockSize[0] * blockSize[1] * 1.5;
  const isLargeBlock = blockArea >= MIN_BLOCK_AREA_FOR_EXTRA_CONTENT;
  const isLandscape = blockSize[0] > blockSize[1] * 1.4;
  console.log("isLandscape", isLandscape);

  return (
    <div className="@container group">
      <div
        className={`flex gap-4 h-full items-center ${
          isLandscape ? "flex-row" : "flex-col"
        }`}
      >
        {featuredImageUrl && isLargeBlock && (
          <div className={isLandscape ? "w-1/2" : "h-1/2"}>
            <img
              src={featuredImageUrl || ""}
              alt={featuredImageAlt || ""}
              className={`object-cover `}
            />
          </div>
        )}
        <div className={"flex-1"}>
          {postFields.antetitulo && (
            <p className="text-balance text-gray-600 font-medium underline underline-offset-2">
              <Square className="w-2 h-2 bg-primary stroke-primary inline mr-2 mb-1" />
              {postFields.antetitulo}
            </p>
          )}

          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:underline">
            {title}
          </h2>
          {postFields.chamadaDestaque && <p>{postFields.chamadaDestaque}</p>}

          {/* <div className="flex items-center gap-4 text-sm text-gray-600">
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
       </div> */}
        </div>
      </div>
    </div>
  );
}
