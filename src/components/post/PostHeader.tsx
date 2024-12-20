import { Calendar, User } from "lucide-react";
import { WPPost } from "@/types/wordpress";

interface PostHeaderProps {
  post: WPPost;
}

export function PostHeader({ post }: PostHeaderProps) {
  const author = post._embedded?.author?.[0]?.name || "Unknown Author";
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return (
    <header className="mb-8">
      <h1
        className="text-4xl md:text-5xl font-serif font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />

      <div className="flex items-center gap-4 text-gray-600 mb-6">
        <span className="flex items-center gap-1">
          <User className="w-4 h-4" />
          {author}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          asd
        </span>
      </div>

      {featuredImage && (
        <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
          <img
            src={featuredImage}
            alt={post.title.rendered}
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </header>
  );
}
