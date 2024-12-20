import { WPPost } from "@/types/wordpress";

interface PostFooterProps {
  post: WPPost;
}

export function PostFooter({ post }: PostFooterProps) {
  return <footer className="mt-12 pt-8 border-t border-gray-200">asd</footer>;
}
