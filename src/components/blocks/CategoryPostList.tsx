import React from "react";
import { Calendar, User } from "lucide-react";
import {
  formatDate,
  shouldShowAuthor,
  shouldShowDate,
  shouldHaveDifferentStyles,
} from "../../utils/categoryUtils";
import Link from "next/link";
import { CategoryPostNode } from "@/hooks/useCategoryPosts";
import { twMerge } from "tailwind-merge";

interface CategoryPostListProps {
  posts: CategoryPostNode[];
  categoryId: number;
  shouldLink: boolean;
  isLandscape: boolean;
}

export function CategoryPostList({
  posts,
  categoryId,
  shouldLink,
  isLandscape,
}: CategoryPostListProps) {
  return (
    <div
      className={twMerge(
        "h-full flex justify-between gap-x-2 flex-col",
        isLandscape && "flex-row"
      )}
    >
      {posts?.map((post) => (
        <ArticleContent
          post={post}
          isLandscape={isLandscape}
          isSpecialStyle={shouldHaveDifferentStyles(categoryId)}
        />
      ))}
    </div>
  );
}

const ArticleContent = ({
  post,
  isSpecialStyle,
  isLandscape,
}: {
  post: CategoryPostNode;
  isSpecialStyle: boolean;
  isLandscape: boolean;
}) => {
  return (
    <a
      key={post.id}
      href={post.uri!}
      className={twMerge(
        "group cursor-pointer pb-4 border-b border-gray-100 last:border-0 flex-1 ",
        isLandscape && "border-none"
      )}
    >
      <div className="h-full relative  overflow-hidden rounded-md">
        <div
          className={twMerge(
            "absolute backdrop-blur-xl w-full text-white font-medium bg-primary-dark opacity-90 group-hover:opacity-100 transition-opacity duration-400 px-2 z-10 min-h-16 line-clamp-4 bottom-0 rounded-b-md text-center font-serif text-lg text-pretty border-white border-t-2",
            isSpecialStyle && "bg-slate-800 text-right"
          )}
        >
          {post.title}
        </div>
        {isLandscape && post.featuredImage?.node.sourceUrl && (
          <img
            src={post.featuredImage?.node.sourceUrl}
            alt={post.featuredImage?.node.altText || ""}
            className="object-cover rounded-md w-full h-full group-hover:scale-110 transition-all duration-300"
          />
        )}
      </div>
    </a>
  );
};
