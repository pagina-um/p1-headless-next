import { customPostFields } from "@/types";
import { Maybe } from "graphql/jsutils/Maybe";
import { User, Calendar } from "lucide-react";

export function ModernStoryLayout({
  featuredImageUrl,
  featuredImageAlt,
  featuredImageSrcSet,
  postFields,
  title,
  author,
  date,
}: {
  featuredImageUrl: string;
  featuredImageAlt: string;
  featuredImageSrcSet: Maybe<string>;
  postFields: customPostFields;
  title: string;
  author: any;
  date: string;
}) {
  return (
    <div className="relative h-full overflow-hidden  shadow-lg group">
      {featuredImageUrl && (
        <img
          src={featuredImageUrl || ""}
          srcSet={featuredImageSrcSet || undefined}
          alt={featuredImageAlt || ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="absolute bottom-0 p-6 text-white">
          {postFields.antetitulo && <p>{postFields.antetitulo}</p>}

          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
            {title}
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
