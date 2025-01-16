import React from "react";
import { Calendar, User } from "lucide-react";
import { shouldHaveDifferentStyles } from "../../utils/categoryUtils";
import Link from "next/link";
import { CategoryPostNode } from "@/hooks/useCategoryPosts";
import { twMerge } from "tailwind-merge";

interface CategoryPostListProps {
  posts: CategoryPostNode[];
  categoryId: number;
  shouldLink: boolean;
  isLandscape: boolean;
}

export function CategoryPostList({ posts, categoryId }: CategoryPostListProps) {
  return (
    <div className={twMerge("h-full flex justify-between gap-x-2 flex-col")}>
      {posts?.map((post) => (
        <ArticleContent
          key={post.id}
          post={post}
          isSpecialStyle={shouldHaveDifferentStyles(categoryId)}
        />
      ))}
    </div>
  );
}

const ArticleContent = ({
  post,
  isSpecialStyle,
}: {
  post: CategoryPostNode;
  isSpecialStyle: boolean;
}) => {
  return (
    <a
      key={post.id}
      href={post.uri!}
      className={twMerge(
        "group cursor-pointer pb-4 border-b border-gray-100 last:border-0 flex-1 "
      )}
    >
      <div className="h-full relative  overflow-hidden rounded-md">
        <div>{post.title}</div>
      </div>
    </a>
  );
};
