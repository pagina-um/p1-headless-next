import {
  Calendar,
  Facebook,
  MessageCircle,
  Twitter,
  TwitterIcon,
  User,
  X,
} from "lucide-react";
import { PostBySlugData } from "@/app/[yearOrSlug]/[month]/[day]/[slug]/page";
import { formatDate } from "@/utils/categoryUtils";
import SocialShare from "./SocialShare";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
interface PostHeaderProps {
  post: PostBySlugData["data"];
}
export function PostHeader({ post }: { post: PostBySlugData["data"] }) {
  const author = post?.postBy?.author?.node.name || "Unknown Author";
  const authorSlug = post?.postBy?.author?.node.slug;
  const antetitulo = (post?.postBy?.postFields as any).antetitulo || "";
  return (
    <header className="mb-4 md:mb-8">
      {/* Title */}
      <h2
        className={twMerge(
          "flex font-sans bg-primary-dark w-fit pr-2 items-start text-pretty text-white font-medium text-sm gap-x-1 before:content-[''] before:block before:w-1 before:h-full before:bg-white before:flex-shrink-0"
        )}
      >
        {antetitulo}
      </h2>
      <h1
        className="text-4xl md:text-5xl font-serif font-bold mb-3 md:mb-8"
        dangerouslySetInnerHTML={{ __html: post?.postBy?.title || "" }}
      />

      {/* Author, date, and share */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={authorSlug ? `/author/${authorSlug}` : "#"} className="hover:text-primary transition-colors">
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
