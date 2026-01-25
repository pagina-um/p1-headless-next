import {
  Calendar,
  Facebook,
  MessageCircle,
  Twitter,
  TwitterIcon,
  User,
  X,
} from "lucide-react";
import { PostBySlugData } from "@/services/posts";
import { formatDate } from "@/utils/categoryUtils";
import SocialShare from "./SocialShare";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { ViewTransition } from "@/components/ui/ViewTransition";

interface PostHeaderProps {
  post: PostBySlugData["data"];
  slug?: string;
}
export function PostHeader({ post, slug }: PostHeaderProps) {
  const author = post?.postBy?.author?.node.name || "Unknown Author";
  const authorSlug = post?.postBy?.author?.node.slug;
  const antetitulo = (post?.postBy?.postFields as any).antetitulo || "";
  return (
    <header className="mb-4 md:mb-8">
      {/* Antetitulo */}
      <ViewTransition name={slug ? `antetitulo-${slug}` : undefined}>
        <h2
          className={twMerge(
            "flex font-sans bg-primary-dark w-fit pr-2 items-start text-pretty text-white font-semibold text-xs p-2 gap-x-1 before:content-[''] before:block before:w-1 before:h-full before:bg-white before:flex-shrink-0 mb-2"
          )}
        >
          {antetitulo}
        </h2>
      </ViewTransition>
      {/* Title */}
      <ViewTransition name={slug ? `title-${slug}` : undefined}>
        <h1
          className="text-4xl md:text-5xl font-serif font-bold mb-3 md:mb-8"
          dangerouslySetInnerHTML={{ __html: post?.postBy?.title || "" }}
        />
      </ViewTransition>

      {/* Author, date, and share */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href={authorSlug ? `/author/${authorSlug}` : "#"}
            className="hover:text-primary transition-colors"
          >
            {author}
          </Link>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post?.postBy?.date || "")}
          </span>
        </div>
        <SocialShare
          url={"http://paginaum.pt" + (post?.postBy?.uri || "")}
          description=""
          title={post?.postBy?.title || ""}
        />
      </div>
    </header>
  );
}
