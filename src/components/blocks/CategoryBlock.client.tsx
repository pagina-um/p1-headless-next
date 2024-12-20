"use client";
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { CategoryBlock as CategoryBlockType } from "../../types";
import { useCategoryPosts } from "../../hooks/useCategoryPosts";
import { CategoryBlockHeader } from "./CategoryBlockHeader";
import { CategoryPostList } from "./CategoryPostList";
import { ErrorMessage } from "../ui/ErrorMessage";
import { CategoryBlockProps } from "./CategoryBlock.server";

export function CategoryBlockClient({ block }: CategoryBlockProps) {
  // Keep track of the current postsPerPage value to avoid unnecessary refetches
  const [currentPostsPerPage, setCurrentPostsPerPage] = useState(
    block.postsPerPage || 5
  );

  // Update currentPostsPerPage when block.postsPerPage changes (settings are closed)
  useEffect(() => {
    setCurrentPostsPerPage(block.postsPerPage || 5);
  }, [block.postsPerPage]);

  const {
    data,
    fetching: loading,
    error,
  } = useCategoryPosts(block.wpCategoryId, currentPostsPerPage);

  const posts = data?.posts?.nodes || [];

  if (!block.wpCategoryId) {
    return (
      <div className="h-full p-6 bg-white  shadow-sm border border-gray-100">
        <p className="text-gray-500 italic font-body-serif">
          Configuração de categoria inválida
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-2 px-3 bg-white shadow-sm border border-gray-100 block-content">
      <CategoryBlockHeader title={block.wpCategoryName} />

      <div className="space-y-4 overflow-auto h-[calc(100%-3rem)]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <ErrorMessage message="Não foi possível carregar os artigos desta categoria." />
        ) : posts.length > 0 ? (
          <CategoryPostList
            posts={posts}
            categoryId={block.wpCategoryId}
            shouldLink={false}
            isLandscape={
              block.gridPosition.width * 1.5 > block.gridPosition.height
            }
          />
        ) : (
          <p className="text-gray-500 italic font-body-serif">
            Ainda não existem artigos nesta categoria
          </p>
        )}
      </div>
    </div>
  );
}
