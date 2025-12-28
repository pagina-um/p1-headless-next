import { Calendar } from "lucide-react";
import { formatDate } from "@/utils/categoryUtils";
import SocialShare from "./SocialShare";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { Post, Author, Media } from "@/types";

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const authorObj = typeof post.author === "object" ? (post.author as Author) : null;
  const author = authorObj?.name || "Unknown Author";
  const authorSlug = authorObj?.slug;
  const authorAvatar = authorObj?.avatar;
  // Avatar can be number | null | Media - extract URL only if it's a Media object
  const avatarUrl = authorAvatar && typeof authorAvatar === "object" ? (authorAvatar as Media)?.url : null;
  const antetitulo = post.antetitulo || "";
  const postUrl = `http://paginaum.pt${post.uri || ""}`;
  return (
    <header className="mb-8">
      {/* Title */}
      {antetitulo && (
        <h2
          className={twMerge(
            "bg-opacity-50 flex font-sans bg-white w-fit pr-2 border items-start text-pretty text-primary-dark font-medium underline-offset-2 text-sm gap-x-1 before:content-[''] before:block before:w-1 before:h-full before:bg-primary-dark before:flex-shrink-0"
          )}
        >
          {antetitulo}
        </h2>
      )}
      <h1
        className="text-4xl md:text-5xl font-serif font-bold mb-8"
        dangerouslySetInnerHTML={{ __html: post.title || "" }}
      />

      {/* Author info section - centered on mobile */}
      <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center md:flex-row md:gap-4">
          {/* Avatar */}
          {avatarUrl && (
            <Link href={authorSlug ? `/author/${authorSlug}` : "#"} className="relative w-14 h-14 md:w-12 md:h-12 mb-2 md:mb-0 block hover:opacity-80 transition-opacity">
              <Image
                src={avatarUrl}
                alt="Author avatar"
                className="rounded-full border-2 border-primary-dark"
                fill
                sizes="(max-width: 768px) 64px, 48px"
              />
            </Link>
          )}

          {/* Author name and date */}
          <div className="flex items-center gap-2 text-gray-500">
            <Link href={authorSlug ? `/author/${authorSlug}` : "#"} className="text-md hover:text-primary transition-colors">
              {author}
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 flex items-center gap-1 text-md">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishedAt || "")}
            </span>
          </div>
        </div>

        {/* Social share section */}
        <div className="flex gap-4">
          <SocialShare
            url={postUrl}
            description=""
            title={post.title || ""}
          />
        </div>
      </div>
    </header>
  );
}
