"use client";

import { GET_POST_BY_ID } from "@/services/wp-graphql";
import { StoryBlock } from "@/types";
import { useQuery } from "@urql/next";
import { User, Calendar, FileWarningIcon } from "lucide-react";
import Link from "next/link";

interface NewsStoryProps {
  story: StoryBlock;
}

export function NewsStoryClient({ story }: NewsStoryProps) {
  const { wpPostId, style = "moderno" } = story;

  const [{ data, error }] = useQuery({
    query: GET_POST_BY_ID,
    variables: { id: wpPostId.toString() },
  });

  if (!data?.post || error) {
    console.error(error, wpPostId);
    return (
      <div className="h-full flex items-center justify-center text-center flex-col text-gray-400 text-sm gap-1">
        <FileWarningIcon className="w-6 h-6 " />
        Conteúdo não encontrado.
      </div>
    );
  }
  const {
    post: { author, featuredImage, uri, title, date },
  } = data;

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