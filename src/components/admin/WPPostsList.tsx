import React from "react";
import { Plus } from "lucide-react";
import { GET_LATEST_POSTS } from "@/services/wp-graphql";
import { ResultOf } from "gql.tada";

type Posts = ResultOf<typeof GET_LATEST_POSTS>["posts"];

interface WPPostsListProps {
  posts: Posts;
  onSelectPost: (databaseId: number, postId: string) => void;
}

export function WPPostsList({ posts, onSelectPost }: WPPostsListProps) {
  return !posts?.nodes ? (
    "Não existem posts para apresentar"
  ) : (
    <div className="space-y-2">
      {posts.nodes.map((post) => (
        <div
          key={post.databaseId}
          className="p-3 border  hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-medium text-sm line-clamp-2"
              dangerouslySetInnerHTML={{ __html: post.title || "" }}
            />
            <button
              onClick={() => {
                onSelectPost(post.databaseId, post.id);
              }}
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
