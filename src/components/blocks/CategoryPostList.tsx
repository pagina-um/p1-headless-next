import React from "react";
import { Calendar, User } from "lucide-react";
import {
  formatDate,
  shouldShowAuthor,
  shouldShowDate,
} from "../../utils/categoryUtils";
import Link from "next/link";
import { CategoryPostNode } from "@/hooks/useCategoryPosts";

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
    className="group cursor-pointer pb-4 border-b border-gray-100 last:border-0 flex-1 @3xl:border-none"
  >
    {post.featuredImage?.node.sourceUrl && (
      <img
        src={post.featuredImage?.node.sourceUrl}
        alt={post.title || ""}
        className="aspect-video object-cover hidden @3xl:block"
      />
    )}
    <h3 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2 @3xl:line-clamp-3">
      {post.title}
    </h3>
    <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 font-body-serif">
      {showAuthor && (
        <span className="flex items-center gap-1">
          <User className="w-4 h-4" />
          {post.author?.node.name}
        </span>
      )}
      {showDate && post.date && (
        <span className="flex items-center gap-1 font-sans @3xl:hidden">
          <Calendar className="w-4 h-4" />
          {formatDate(post.date)}
        </span>
      )}
    </div>
  </article>
);
