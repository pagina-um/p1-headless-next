"use client";
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { CategoryBlock as CategoryBlockType } from "../../types";
import { useCategoryPosts } from "../../hooks/useCategoryPosts";
import { CategoryBlockHeader } from "./CategoryBlockHeader";
import { CategoryPostList } from "./CategoryPostList";
import { ErrorMessage } from "../ui/ErrorMessage";

interface CategoryBlockProps {
  block: CategoryBlockType;
}

export function CategoryBlock({ block }: CategoryBlockProps) {
  // Keep track of the current postsPerPage value to avoid unnecessary refetches
  const [currentPostsPerPage, setCurrentPostsPerPage] = useState(
    block.postsPerPage || 5
  );

  // Update currentPostsPerPage when block.postsPerPage changes (settings are closed)
  useEffect(() => {
    setCurrentPostsPerPage(block.postsPerPage || 5);
  }, [block.postsPerPage]);

  const { posts, loading, error } = useCategoryPosts(
    block.categoryId,
    currentPostsPerPage
  );

  if (!block.categoryId) {
    return (
      <div className="h-full p-6 bg-white  shadow-sm border border-gray-100">
        <p className="text-gray-500 italic font-body-serif">
          Configuração de categoria inválida
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-white  shadow-sm border border-gray-100 block-content">
      <CategoryBlockHeader title={block.title} />

      <div className="space-y-4 overflow-auto h-[calc(100%-4rem)]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <ErrorMessage message="Não foi possível carregar os artigos desta categoria." />
        ) : posts.length > 0 ? (
          <CategoryPostList posts={posts} categoryId={block.categoryId} />
        ) : (
          <p className="text-gray-500 italic font-body-serif">
            Ainda não existem artigos nesta categoria
          </p>
        )}
      </div>
    </div>
  );
}
