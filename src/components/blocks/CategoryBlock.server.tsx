import React from "react";
import { CategoryBlock as CategoryBlockType } from "../../types";
import { CategoryBlockHeader } from "./CategoryBlockHeader";
import { CategoryPostList } from "./CategoryPostList";
import { getPostsByCategoryId } from "@/services/payload-api";

export interface CategoryBlockProps {
  block: CategoryBlockType;
  excludePostIds: string[];
}

export async function CategoryBlockServer({
  block,
  excludePostIds,
}: CategoryBlockProps) {
  const { data, error } = await getPostsByCategoryId(
    block.wpCategoryId,
    block.postsPerPage,
    excludePostIds
  );
  const posts = data?.posts?.nodes || [];
  const category = data?.category;

  if (!block.wpCategoryId || error) {
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
      <CategoryBlockHeader
        title={block.wpCategoryName}
        link={`/cat/${category?.slug}`}
      />
      <div className="space-y-4 overflow-clip h-[calc(100%-3rem)]">
        {posts.length > 0 ? (
          <CategoryPostList
            posts={posts}
            categoryId={block.wpCategoryId}
            shouldLink={true}
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
