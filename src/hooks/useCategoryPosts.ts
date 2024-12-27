import { useQuery } from "@urql/next";
import { GET_POSTS_BY_CATEGORY } from "@/services/experiment";

export function useCategoryPosts(categoryId: number, postsPerPage: number = 5) {
  const [{ fetching, error, data }] = useQuery({
    query: GET_POSTS_BY_CATEGORY,
    variables: {
      categoryId: categoryId,
      postsPerPage,
    },
  });
  return { fetching, error, data };
}
