import React, { useState, useEffect } from "react";
import { Tag, Loader } from "lucide-react";
import { useQuery } from "@urql/next";
import { GET_CATEGORIES } from "@/services/experiment";

interface CategoryBlockCreatorProps {
  onCreateBlock: (categoryId: number, title: string) => void;
}

export function CategoryBlockCreator({
  onCreateBlock,
}: CategoryBlockCreatorProps) {
  const [{ data, error, fetching: loading }] = useQuery({
    query: GET_CATEGORIES,
  });

  const categories = data?.categories?.nodes;

  if (loading) {
    return (
      <div className="border-t mt-4 pt-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader className="w-5 h-5 animate-spin" />
          <span>A carregar categorias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t mt-4 pt-4">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Tag className="w-5 h-5" />
        Blocos de Categoria
      </h3>
      <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2 grid grid-cols-2 gap-2">
        {categories?.map((category) => (
          <button
            key={category.id}
            onClick={() => onCreateBlock(category.databaseId, category.name!)}
            className="px-3 py-2 bg-gray-100  text-sm capitalize hover:bg-gray-200 transition-colors flex items-center justify-between group"
          >
            <span>{category.name}</span>
            <span className="text-xs text-gray-500 group-hover:text-gray-700">
              {category.count} artigos
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
