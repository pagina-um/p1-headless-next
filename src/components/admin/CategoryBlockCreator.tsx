import React, { useState, useEffect } from "react";
import { Tag, Loader } from "lucide-react";
import { getCategories } from "../../services/wordpress";
import type { WPCategory } from "../../types/wordpress";

interface CategoryBlockCreatorProps {
  onCreateBlock: (categoryId: number, title: string) => void;
}

export function CategoryBlockCreator({
  onCreateBlock,
}: CategoryBlockCreatorProps) {
  const [categories, setCategories] = useState<WPCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const wpCategories = await getCategories();
        setCategories(wpCategories);
      } catch (err) {
        setError("Falha ao carregar categorias");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
        <p className="text-red-500">{error}</p>
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
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCreateBlock(category.id, category.name)}
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
