import { PostBySlugData } from "@/app/[year]/[month]/[day]/[slug]/page";

interface PostFooterProps {
  post: PostBySlugData["data"];
}

export function PostFooter({ post }: PostFooterProps) {
  return <footer className="mt-12 pt-8 border-t border-gray-200">asd</footer>;
}
