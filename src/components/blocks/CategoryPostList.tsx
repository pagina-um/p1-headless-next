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
}

export function CategoryPostList({
  posts,
  categoryId,
  shouldLink,
}: CategoryPostListProps) {
  const showAuthor = shouldShowAuthor(categoryId);
  const showDate = shouldShowDate(categoryId);
  return (
    <div className="h-full flex flex-col @3xl:flex-row justify-between gap-x-2 ">
      {posts?.map((post) =>
        shouldLink ? (
          <Link href={post.uri || "#"} key={post.id} passHref>
            <ArticleContent
              post={post}
              showAuthor={showAuthor}
              showDate={showDate}
            />
          </Link>
        ) : (
          <ArticleContent
            post={post}
            showAuthor={showAuthor}
            showDate={showDate}
            key={post.id}
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
}: {
  post: CategoryPostNode;
  showAuthor: boolean;
  showDate: boolean;
}) => (
  <article
    key={post.id}
    className="group cursor-pointer pb-4 border-b border-gray-100 last:border-0 flex-1 @3xl:border-none flex justify-between items-center gap-2"
  >
    <div>
      {" "}
      {showAuthor && (
        <p className="font-thin text-lg"> {post.author?.node.name}</p>
      )}
      <h3
        className={twMerge(
          "font-serif text-lg font-semibold group-hover:text-primary transition-colors line-clamp-3 @3xl:line-clamp-3",
          showAuthor && "text-xl italic"
        )}
      >
        "{post.title}"
      </h3>
      <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 font-body-serif">
        {showDate && post.date && (
          <span className="flex items-center gap-1 font-sans @3xl:hidden">
            <Calendar className="w-4 h-4" />
            {formatDate(post.date)}
          </span>
        )}
      </div>
    </div>
    {showAuthor && (
      <div className="flex items-center gap-3 flex-shrink-0 justify-end font-thin text-md text-slate-900">
        {post.author?.node.avatar?.url ? (
          <img
            src={post.author?.node.avatar?.url}
            alt={post.author?.node.name || ""}
            className="w-12 h-12 rounded-full border-2 border-primary-dark"
          />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>
    )}
  </article>
);
