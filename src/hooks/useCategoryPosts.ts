import { useEffect, useState } from "react";

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
        // Fetch category data and posts from Payload API
        const categoryResponse = await fetch(`/api/content/categories/${categoryId}`);
        if (!categoryResponse.ok) throw new Error("Failed to fetch category");
        const category = await categoryResponse.json();

        // Fetch posts for this category
        const postsResponse = await fetch(
          `/api/content/posts?category=${categoryId}&limit=${postsPerPage}&exclude=${excludePostIds.join(",")}`
        );
        if (!postsResponse.ok) throw new Error("Failed to fetch posts");
        const postsData = await postsResponse.json();

        setData({
          category,
          posts: { nodes: postsData.docs || [] },
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
