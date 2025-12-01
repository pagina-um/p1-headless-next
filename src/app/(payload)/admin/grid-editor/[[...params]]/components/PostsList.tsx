"use client";

import { useGrid } from "@/components/ui/GridContext";
import { useEffect, useState } from "react";
import { Loader, Calendar, User } from "lucide-react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  wpDatabaseId?: number;
  featuredImage?: {
    url: string;
    alt?: string;
  };
  author?: {
    name: string;
  };
}

export function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleCreateStoryBlock } = useGrid();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/posts?limit=50&status=publish&sort=-publishedAt");
        const data = await response.json();

        if (data.docs) {
          setPosts(data.docs);
        } else {
          setError("Failed to load posts");
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Error loading posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No published posts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {posts.map((post) => (
        <button
          key={post.id}
          onClick={() => handleCreateStoryBlock(post.wpDatabaseId || 0, post.id)}
          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex gap-3">
            {post.featuredImage?.url && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                <Image
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt || post.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>

              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                {post.author?.name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
