import React from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { CategoryBlock as CategoryBlockType, PayloadPost, PayloadCategory } from "../../types";
import { CategoryBlockHeader } from "./CategoryBlockHeader";
import { CategoryPostList } from "./CategoryPostList";

export interface CategoryBlockProps {
  block: CategoryBlockType;
  excludePostIds: string[];
}

export async function CategoryBlockServer({
  block,
  excludePostIds,
}: CategoryBlockProps) {
  // Use Payload categoryId if available, fall back to wpCategoryId for legacy blocks
  const effectiveCategoryId = block.categoryId || block.wpCategoryId;

  if (!effectiveCategoryId) {
    return (
      <div className="h-full p-6 bg-white shadow-sm border border-gray-100">
        <p className="text-gray-500 italic font-body-serif">
          Configuração de categoria inválida
        </p>
      </div>
    );
  }

  const payload = await getPayload({ config });

  // Fetch category
  let category: PayloadCategory | null = null;
  try {
    // Try by ID first
    const categoryDoc = await payload.findByID({
      collection: "categories",
      id: String(effectiveCategoryId),
    });
    category = categoryDoc as PayloadCategory;
  } catch {
    // Try by wpDatabaseId
    const result = await payload.find({
      collection: "categories",
      where: {
        wpDatabaseId: { equals: Number(effectiveCategoryId) },
      },
      limit: 1,
    });
    category = (result.docs[0] as PayloadCategory) || null;
  }

  if (!category) {
    return (
      <div className="h-full p-6 bg-white shadow-sm border border-gray-100">
        <p className="text-gray-500 italic font-body-serif">
          Categoria não encontrada
        </p>
      </div>
    );
  }

  // Fetch posts for this category
  const postsResult = await payload.find({
    collection: "posts",
    where: {
      categories: { in: [category.id] },
      status: { equals: "publish" },
      ...(excludePostIds.length > 0 && {
        id: { not_in: excludePostIds },
      }),
    },
    limit: block.postsPerPage,
    sort: "-publishedAt",
    depth: 2,
  });

  const posts = postsResult.docs as PayloadPost[];

  return (
    <div className="h-full p-2 px-3 bg-white shadow-sm border border-gray-100 block-content">
      <CategoryBlockHeader
        title={block.wpCategoryName || category.name}
        link={`/cat/${category.slug}`}
      />
      <div className="space-y-4 overflow-clip h-[calc(100%-3rem)]">
        {posts.length > 0 ? (
          <CategoryPostList
            posts={posts}
            categoryId={category.wpDatabaseId ?? undefined}
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
