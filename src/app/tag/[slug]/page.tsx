import { GET_POSTS_BY_TAG_SLUG, GET_TAG_METADATA, getClient } from "@/services/wp-graphql";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/categoryUtils";
import { Calendar, User } from "lucide-react";
import { Metadata } from "next";

// Enable ISR with 1 hour revalidation for better caching
// First page load will be cached, subsequent pagination requests will be dynamic
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { data } = await getClient().query(GET_TAG_METADATA, {
    slug: params.slug,
  });

  const tag = data?.tags?.nodes[0];
  const name = tag?.name || params.slug;
  const description = tag?.description || `Artigos com a tag ${name}`;

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
    },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; after?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const postsPerPage = 12; // Increased for grid layout

  const afterCursor = searchParams.after
    ? decodeURIComponent(searchParams.after)
    : null;

  const { data, error } = await getClient().query(
    GET_POSTS_BY_TAG_SLUG,
    {
      slug: params.slug,
      postsPerPage,
      after: afterCursor,
    },
    currentPage > 1 || !!afterCursor
      ? { requestPolicy: "network-only" }
      : undefined
  );

  const tag = data?.tags?.nodes[0];
  const posts = data?.posts?.nodes;
  const pageInfo = data?.posts?.pageInfo;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">
        {tag?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post: any, index: number) => (
          <article
            key={post.slug}
            className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <Link href={post.uri} className="block">
              {post.featuredImage?.node?.sourceUrl && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || ""}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority={index < 2}
                  />
                </div>
              )}
              <div className="p-6 pb-0">
                <h2 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </div>
            </Link>
            <div className="px-6 pb-6">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {post.author?.node?.name && (
                  <Link
                    href={post.author.node.slug ? `/author/${post.author.node.slug}` : "#"}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {post.author.node.name}
                  </Link>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.date)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pageInfo && (
        <Pagination
          currentPage={currentPage}
          hasNextPage={pageInfo.hasNextPage}
          basePath={`/tag/${params.slug}`}
          startCursor={pageInfo.startCursor}
          endCursor={pageInfo.endCursor}
        />
      )}
    </div>
  );
}
