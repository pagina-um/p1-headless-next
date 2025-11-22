import { useEffect, useState } from "react";
import { getCategory, getPostsByCategory } from "@/app/(payload)/admin/grid-editor/actions";

export function useCategoryPosts(
  categoryId: number,
  postsPerPage: number = 5,
  excludePostIds: string[] = []
) {
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setFetching(true);
        // Fetch category data and posts using server functions
        const category = await getCategory(categoryId.toString());
        const postsData = await getPostsByCategory(categoryId, postsPerPage);

        setData({
          category,
          posts: postsData.posts, // Already in correct format from service layer
        });
      } catch (err) {
        setError(err);
      } finally {
        setFetching(false);
      }
    }

    if (categoryId) {
      fetchPosts();
    }
  }, [categoryId, postsPerPage, excludePostIds.join(",")]);

  return { fetching, error, data };
}

export type CategoryPostNode = any;
