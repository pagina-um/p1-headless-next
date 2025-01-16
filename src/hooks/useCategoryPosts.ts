import { useQuery } from "@urql/next";
import { GET_POSTS_BY_CATEGORY } from "@/services/wp-graphql";
import { ResultOf } from "gql.tada";

export function useCategoryPosts(categoryId: number, postsPerPage: number = 5) {
  const [{ fetching, error, data }] = useQuery({
    query: GET_POSTS_BY_CATEGORY,
    variables: {
      sameCategoryIdAsString: categoryId.toString(),
      categoryId: categoryId,
      postsPerPage,
    },
  });
  return { fetching, error, data };
}

export type CategoryPostNode = NonNullable<
  ResultOf<typeof GET_POSTS_BY_CATEGORY>["posts"]
>["nodes"][number];
