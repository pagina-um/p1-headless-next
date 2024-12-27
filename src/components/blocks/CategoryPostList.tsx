import React from "react";
import { Calendar, User } from "lucide-react";
import { shouldShowAuthor, shouldShowDate } from "../../utils/categoryUtils";
import Link from "next/link";

interface CategoryPostListProps {
  posts: any[]; // TODO: Replace with proper type
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
    <div className="space-y-4 h-full flex flex-col justify-between">
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
  post: any;
  showAuthor: boolean;
  showDate: boolean;
}) => (
  <article
    key={post.id}
    className="group cursor-pointer pb-4 border-b border-gray-100 last:border-0"
  >
    <h3 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
      {post.title}
    </h3>
    <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 font-body-serif">
      {showAuthor && (
        <span className="flex items-center gap-1">
          <User className="w-4 h-4" />
          {post.author?.node.name}
        </span>
      )}
      {showDate && (
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          asd
        </span>
      )}
    </div>
  </article>
);
