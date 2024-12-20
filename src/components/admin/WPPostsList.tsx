import React from "react";
import { WPPost } from "../../types/wordpress";
import { Plus } from "lucide-react";

interface WPPostsListProps {
  posts: WPPost[];
  onSelectPost: (post: WPPost) => void;
}

export function WPPostsList({ posts, onSelectPost }: WPPostsListProps) {
  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-3 border  hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-medium text-sm line-clamp-2"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <button
              onClick={() => onSelectPost(post)}
              className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1 flex-shrink-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
