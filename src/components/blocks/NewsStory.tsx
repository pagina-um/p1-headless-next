import React from "react";
import { User, Calendar } from "lucide-react";
import Link from "next/link";

import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { StoryBlock } from "@/types";

interface NewsStoryProps {
  story: StoryBlock;
}

export async function NewsStory({ story }: NewsStoryProps) {
  const { wpPostId, style = "moderno" } = story;

  const { data, error } = await getClient().query(GET_POST_BY_ID, {
    id: wpPostId.toString(),
  });

  if (!data?.post || error) {
    console.error(error, wpPostId);
    return "Conteúdo não encontrado.";
  }
  const {
    post: { author, featuredImage, uri, title, date, excerpt },
  } = data;
  const showExcerpt = excerpt && !excerpt.includes("<p>.</p>");

  if (style === "classico") {
    return (
      <Link href={uri || ""} passHref>
        <div className="h-full bg-white shadow-lg group overflow-hidden">
          {featuredImage && (
            <div className="aspect-video overflow-hidden">
              <img
                src={featuredImage?.node.sourceUrl || ""}
                alt={featuredImage?.node.altText || ""}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
              {title}
            </h2>
            {showExcerpt && (
              <div 
                className="text-gray-600 mb-4 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: excerpt }}
              />
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
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
      </Link>
    );
  }

  return (
    <Link href={uri || ""} passHref>
      <div className="relative h-full overflow-hidden shadow-lg group">
        {featuredImage && (
          <img
            src={featuredImage?.node.sourceUrl || ""}
            alt={featuredImage?.node.altText || ""}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="absolute bottom-0 p-6 text-white">
            {showExcerpt && (
              <div dangerouslySetInnerHTML={{ __html: excerpt }} />
            )}
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
    </Link>
  );
}