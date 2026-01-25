import { GET_POST_BY_SLUG, getClient } from "@/services/wp-graphql";

export async function getPostBySlug(slug: string) {
  const { data, error } = await getClient().query(GET_POST_BY_SLUG, {
    slug,
  });
  return { data, error };
}

export type PostBySlugData = NonNullable<
  Awaited<ReturnType<typeof getPostBySlug>>
>;
