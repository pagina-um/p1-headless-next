import React from "react";
import { CategoryBlock as CategoryBlockType } from "../../types";
import { CategoryBlockHeader } from "./CategoryBlockHeader";
import { CategoryPostList } from "./CategoryPostList";
import { getPostsByCategory } from "@/services/wordpress";

export interface CategoryBlockProps {
  block: CategoryBlockType;
}

export async function CategoryBlockServer({ block }: CategoryBlockProps) {
  const posts = await getPostsByCategory(
    block.wpCategoryId,
    block.postsPerPage
  );

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
    <div className="h-full p-6 bg-white  shadow-sm border border-gray-100 block-content">
      <CategoryBlockHeader title={block.blockType} />

      <div className="space-y-4 overflow-auto h-[calc(100%-4rem)]">
        {posts.length > 0 ? (
          <CategoryPostList posts={posts} categoryId={block.wpCategoryId} />
        ) : (
          <p className="text-gray-500 italic font-body-serif">
            Ainda não existem artigos nesta categoria
          </p>
        )}
      </div>
    </div>
  );
}
