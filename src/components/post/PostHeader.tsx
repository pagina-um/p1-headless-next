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
import Image from "next/image";
interface PostHeaderProps {
  post: PostBySlugData["data"];
}
export function PostHeader({ post }: { post: PostBySlugData["data"] }) {
  const author = post?.postBy?.author?.node.name || "Unknown Author";
  const authorAvatar = post?.postBy?.author?.node.avatar;

  return (
    <header className="mb-8">
      {/* Title */}
      {`https://${process.env.VERCEL_URL}/` || ""}
      <h1
        className="text-4xl md:text-5xl font-serif font-bold mb-8"
        dangerouslySetInnerHTML={{ __html: post?.postBy?.title || "" }}
      />

      {/* Author info section - centered on mobile */}
      <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center md:flex-row md:gap-4">
          {/* Avatar */}
          {authorAvatar?.foundAvatar && (
            <div className="relative w-14 h-14 md:w-12 md:h-12 mb-2 md:mb-0">
              <Image
                src={authorAvatar.url || ""}
                alt="Author avatar"
                className="rounded-full border-2 border-primary-dark"
                fill
                sizes="(max-width: 768px) 64px, 48px"
              />
            </div>
          )}

          {/* Author name and date */}
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-md">{author}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 flex items-center gap-1 text-md">
              <Calendar className="w-4 h-4" />
              {formatDate(post?.postBy?.date || "")}
            </span>
          </div>
        </div>

        {/* Social share section */}
        <div className="flex gap-4">
          <SocialShare
            url={"http://www.paginaum.pt" + (post?.postBy?.uri || "")}
            description=""
            title={post?.postBy?.title || ""}
          />
        </div>
      </div>
    </header>
  );
}
