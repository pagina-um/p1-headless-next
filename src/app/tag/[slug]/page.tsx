import { GET_POSTS_BY_TAG_SLUG, getClient } from "@/services/wp-graphql";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";

export default async function TagPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; after?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const postsPerPage = 10;

  const { data, error } = await getClient().query(GET_POSTS_BY_TAG_SLUG, {
    slug: params.slug,
    postsPerPage,
    after: searchParams.after || null,
  });

  const category = data?.tags?.nodes[0];
  const posts = data?.posts?.nodes;
  const pageInfo = data?.posts?.pageInfo;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">{category?.name}</h1>

      <div className="grid gap-8">
        {posts?.map((post: any) => (
          <article key={post.slug} className="border-b pb-8">
            <h2 className="text-2xl font-semibold mb-4">
              <Link href={post.uri}>{post.title}</Link>
            </h2>
            <div>{post.postFields?.chamadaDestaque}</div>
          </article>
        ))}
      </div>

      {pageInfo && (
        <Pagination
          currentPage={currentPage}
          hasNextPage={pageInfo.hasNextPage}
          basePath={`/cat/${params.slug}`}
          startCursor={pageInfo.startCursor}
          endCursor={pageInfo.endCursor}
        />
      )}
    </div>
  );
}
