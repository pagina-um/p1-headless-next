import { GET_POSTS_BY_CATEGORY_SLUG, getClient } from "@/services/wp-graphql";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/categoryUtils";
import { Calendar, User } from "lucide-react";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; after?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const postsPerPage = 12; // Increased for grid layout

  const { data } = await getClient().query(GET_POSTS_BY_CATEGORY_SLUG, {
    slug: params.slug,
    postsPerPage,
    after: searchParams.after || null,
  });

  const category = data?.categories?.nodes[0];
  const posts = data?.posts?.nodes;
  const pageInfo = data?.posts?.pageInfo;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">
        {category?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post: any) => (
          <article
            key={post.slug}
            className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <Link href={post.uri} className="block">
              {post.featuredImage?.node?.sourceUrl && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                {post.postFields?.antetitulo && (
                  <div className="text-primary text-sm font-medium mb-2">
                    {post.postFields.antetitulo}
                  </div>
                )}
                <h2 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.postFields?.chamadaDestaque && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.postFields.chamadaDestaque}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {post.author?.node?.name && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author.node.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.date)}
                  </span>
                </div>
              </div>
            </Link>
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
