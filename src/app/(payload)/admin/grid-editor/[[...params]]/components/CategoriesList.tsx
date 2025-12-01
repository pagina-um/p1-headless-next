"use client";

import { useGrid } from "@/components/ui/GridContext";
import { useEffect, useState } from "react";
import { Loader, FolderOpen } from "lucide-react";
import { getCategories } from "../../actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  wpDatabaseId?: number;
  postCount?: number;
}

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleCreateCategoryBlock } = useGrid();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();

        if (data.docs) {
          setCategories(data.docs);
        } else {
          setError("Failed to load categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Error loading categories");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading categories...</span>
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

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No categories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pr-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() =>
            handleCreateCategoryBlock(category.id, category.name, category.wpDatabaseId)
          }
          className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </div>

              {category.postCount !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  {category.postCount} {category.postCount === 1 ? "post" : "posts"}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
