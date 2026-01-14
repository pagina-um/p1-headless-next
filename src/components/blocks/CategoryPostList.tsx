import React from "react";
import { Calendar, User } from "lucide-react";
import {
  formatDate,
  shouldShowAuthor,
  shouldShowDate,
} from "../../utils/categoryUtils";
import Link from "next/link";
import Image from "next/image";
import { CategoryPostNode } from "@/hooks/useCategoryPosts";
import { twMerge } from "tailwind-merge";

interface CategoryPostListProps {
  posts: CategoryPostNode[];
  categoryId: number;
  shouldLink: boolean;
}

export function CategoryPostList({ posts, categoryId }: CategoryPostListProps) {
  const showAuthor = shouldShowAuthor(categoryId);
  const showDate = shouldShowDate(categoryId);
  return (
    <div className="h-full flex flex-col @3xl:flex-row gap-y-3 divide-y overflow-clip">
      {posts?.map((post) => (
        <ArticleContent
          key={post.id}
          post={post}
          showAuthor={showAuthor}
          showDate={showDate}
        />
      ))}
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
    className="group flex-1 flex justify-between items-center gap-2"
  >
    <div>
      {showAuthor && post.author?.node.name && (
        <Link
          href={post.author?.node.slug ? `/author/${post.author.node.slug}` : "#"}
          className="font-sans text-sm font-[300] text-gray-600 hover:text-primary transition-colors"
        >
          {post.author.node.name}
        </Link>
      )}
      <Link href={post.uri || "#"} className="block">
        <h3
          className={twMerge(
            "font-serif text-lg font-semibold hover:text-primary transition-colors line-clamp-3 @3xl:line-clamp-3",
            showAuthor && "text-xl"
          )}
        >
          "{post.title}"
        </h3>
      </Link>
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
      <Link
        href={post.author?.node.slug ? `/author/${post.author.node.slug}` : "#"}
        className="flex items-center gap-3 flex-shrink-0 justify-end font-thin text-md text-slate-900 hover:opacity-80 transition-opacity"
      >
        {post.author?.node.avatar?.url ? (
          <div className="relative w-12 h-12">
            <Image
              src={post.author?.node.avatar?.url}
              alt={post.author?.node.name || ""}
              className="rounded-full border-2 border-primary-dark"
              fill
              sizes="48px"
            />
          </div>
        ) : (
          <User className="w-4 h-4" />
        )}
      </Link>
    )}
  </article>
);
