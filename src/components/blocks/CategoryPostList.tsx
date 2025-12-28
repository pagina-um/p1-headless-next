import React from "react";
import { Calendar, User } from "lucide-react";
import {
  formatDate,
  shouldShowAuthor,
  shouldShowDate,
} from "../../utils/categoryUtils";
import Link from "next/link";
import Image from "next/image";
import { PayloadPost, Media } from "@/types";
import { twMerge } from "tailwind-merge";
import { decodeHtmlEntities } from "@/utils/utils";

interface CategoryPostListProps {
  posts: PayloadPost[];
  categoryId?: number;
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
  post: PayloadPost;
  showAuthor: boolean;
  showDate: boolean;
}) => {
  const author = typeof post.author === "object" ? post.author : null;
  const authorName = author?.name;
  const authorSlug = author?.slug;
  // Avatar can be number | null | Media - extract URL if it's a Media object
  const authorAvatar = author?.avatar && typeof author.avatar === "object"
    ? (author.avatar as Media).url
    : null;

  return (
    <article
      key={post.id}
      className="group flex-1 flex justify-between items-center gap-2"
    >
      <div>
        {showAuthor && authorName && (
          <Link
            href={authorSlug ? `/author/${authorSlug}` : "#"}
            className="font-sans text-sm font-[300] text-gray-600 hover:text-primary transition-colors"
          >
            {authorName}
          </Link>
        )}
        <Link href={post.uri || "#"} className="block">
          <h3
            className={twMerge(
              "font-serif text-lg font-semibold hover:text-primary transition-colors line-clamp-3 @3xl:line-clamp-3",
              showAuthor && "text-xl"
            )}
          >
            "{decodeHtmlEntities(post.title)}"
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 font-body-serif">
          {showDate && post.publishedAt && (
            <span className="flex items-center gap-1 font-sans @3xl:hidden">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishedAt)}
            </span>
          )}
        </div>
      </div>
      {showAuthor && (
        <Link
          href={authorSlug ? `/author/${authorSlug}` : "#"}
          className="flex items-center gap-3 flex-shrink-0 justify-end font-thin text-md text-slate-900 hover:opacity-80 transition-opacity"
        >
          {authorAvatar ? (
            <div className="relative w-12 h-12">
              <Image
                src={authorAvatar}
                alt={authorName || ""}
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
};
