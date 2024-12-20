import React from "react";
import { Calendar, User } from "lucide-react";
import type { WPPost } from "../../types/wordpress";
import {
  getPostAuthor,
  shouldShowAuthor,
  shouldShowDate,
  formatDate,
} from "../../utils/categoryUtils";

interface CategoryPostListProps {
  posts: WPPost[];
  categoryId: number;
}

export function CategoryPostList({ posts, categoryId }: CategoryPostListProps) {
  const showAuthor = shouldShowAuthor(categoryId);
  const showDate = shouldShowDate(categoryId);

  return (
    <div className="space-y-4 h-full flex flex-col justify-between">
      {posts.map((post) => (
        <article
          key={post.id}
          className="group cursor-pointer pb-4 border-b border-gray-100 last:border-0"
        >
          <h3
            className="font-serif text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 font-body-serif">
            {showAuthor && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {getPostAuthor(post)}
              </span>
            )}
            {showDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
