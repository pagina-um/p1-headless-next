import {
  Calendar,
  Facebook,
  MessageCircle,
  Twitter,
  TwitterIcon,
  User,
  X,
} from "lucide-react";
import { PostBySlugData } from "@/app/[year]/[month]/[day]/[slug]/page";
import { formatDate } from "@/utils/categoryUtils";
import { SocialShare } from "./SocialShare";

interface PostHeaderProps {
  post: PostBySlugData["data"];
}

export function PostHeader({ post }: PostHeaderProps) {
  const author = post?.postBy?.author?.node.name || "Unknown Author";
  const featuredImage = post?.postBy?.featuredImage?.node;

  return (
    <header className="mb-8">
      <h1
        className="text-4xl md:text-5xl font-serif font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post?.postBy?.title || "" }}
      />

      <div className="flex items-center gap-4 text-gray-600 mb-6 justify-between">
        <div className="inline-flex gap-4">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post?.postBy?.date || "")}
          </span>
        </div>
        <SocialShare />
      </div>

      {featuredImage?.sourceUrl && (
        <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
          <img
            src={featuredImage.sourceUrl}
            srcSet={featuredImage.srcSet || undefined}
            alt={featuredImage.altText || undefined}
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </header>
  );
}
