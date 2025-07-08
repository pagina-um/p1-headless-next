import React from "react";
import { Plus, Check } from "lucide-react";
import { GET_LATEST_POSTS } from "@/services/wp-graphql";
import { ResultOf } from "gql.tada";

type Posts = ResultOf<typeof GET_LATEST_POSTS>["posts"];

interface WPPostsListProps {
  posts: Posts;
  onSelectPost: (databaseId: number, postId: string, post?: any) => void;
  selectedPostId?: string;
}

export function WPPostsList({
  posts,
  onSelectPost,
  selectedPostId,
}: WPPostsListProps) {
  return !posts?.nodes ? (
    "Não existem posts para apresentar"
  ) : (
    <div className="space-y-2">
      {posts.nodes.map((post) => {
        const isSelected = selectedPostId === post.id;
        return (
          <div
            key={post.databaseId}
            className={`p-3 border transition-colors cursor-pointer ${
              isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => onSelectPost(post.databaseId, post.id, post)}
          >
            <div className="flex items-center gap-3">
              {post.featuredImage?.node?.sourceUrl && (
                <img
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || 'Featured image'}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium text-sm line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.title || "" }}
                />
                {(() => {
                  // Prioritize custom fields for preview text
                  const postFields = post.postFields as any;
                  const previewText = postFields?.chamadaDestaque || 
                                    postFields?.chamadaManchete || 
                                    post.excerpt;
                  return previewText && (
                    <p 
                      className="text-xs text-gray-500 mt-1 line-clamp-1"
                      dangerouslySetInnerHTML={{ __html: previewText }}
                    />
                  );
                })()}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPost(post.databaseId, post.id, post);
                }}
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3 h-3" />
                    Selecionado
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    Selecionar
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
