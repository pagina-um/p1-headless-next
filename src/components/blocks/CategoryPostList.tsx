import React from "react";
import { Calendar, User } from "lucide-react";
import {
  formatDate,
  shouldShowAuthor,
  shouldShowDate,
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
  const showAuthor = shouldShowAuthor(categoryId);
  const showDate = false; // shouldShowDate(categoryId);

  return (
    <div
      className={twMerge(
        "h-full flex justify-between gap-x-2 flex-col",
        isLandscape && "flex-row"
      )}
    >
      {posts?.map((post) =>
        shouldLink ? (
          <Link href={post.uri || "#"} key={post.id} passHref>
            <ArticleContent
              post={post}
              showAuthor={showAuthor}
              showDate={showDate}
              isLandscape={isLandscape}
            />
          </Link>
        ) : (
          <ArticleContent
            post={post}
            showAuthor={showAuthor}
            showDate={showDate}
            key={post.id}
            isLandscape={isLandscape}
          />
        )
      )}
    </div>
  );
}

const ArticleContent = ({
  post,
  showAuthor,
  showDate,
  isLandscape,
}: {
  post: CategoryPostNode;
  showAuthor: boolean;
  showDate: boolean;
  isLandscape: boolean;
}) => (
  <article
    key={post.id}
    className={twMerge(
      " cursor-pointer pb-4 border-b border-gray-100 last:border-0 flex-1 ",
      isLandscape && "border-none"
    )}
  >
    <div className="h-full relative group ">
      <div className="absolute backdrop-blur-xl w-full text-white font-medium bg-primary-dark opacity-90 px-2 z-10 min-h-16 line-clamp-2 bottom-0 rounded-b-md text-center font-serif text-lg text-pretty">
        {post.title}
      </div>
      {isLandscape && post.featuredImage?.node.sourceUrl && (
        <img
          src={post.featuredImage?.node.sourceUrl}
          alt={post.featuredImage?.node.altText || ""}
          className="object-cover rounded-md w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300"
        />
      )}
    </div>
  </article>
);
