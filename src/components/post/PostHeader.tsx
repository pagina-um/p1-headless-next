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
      <div className="flex items-center gap-4 text-gray-600 justify-between">
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
        <SocialShare
          url={"http://www.paginaum.pt" + (post?.postBy?.uri || "")}
          description=""
          title={post?.postBy?.title || ""}
        />
      </div>
    </header>
  );
}
