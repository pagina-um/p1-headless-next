import { GET_POSTS_BY_AUTHOR_SLUG, GET_AUTHOR_METADATA, getClient } from "@/services/wp-graphql";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/categoryUtils";
import { Calendar, User } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { data } = await getClient().query(GET_AUTHOR_METADATA, {
    authorSlug: params.slug,
  });

  const author = data?.users?.nodes[0];
  const name = author?.name || params.slug;
  const description = author?.description || `Artigos de ${name}`;

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
    },
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; after?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const postsPerPage = 12;

  const afterCursor = searchParams.after
    ? decodeURIComponent(searchParams.after)
    : null;

  const { data } = await getClient().query(
    GET_POSTS_BY_AUTHOR_SLUG,
    {
      authorSlug: params.slug,
      postsPerPage,
      after: afterCursor,
    },
    currentPage > 1 || !!afterCursor
      ? { requestPolicy: "network-only" }
      : undefined
  );

  const author = data?.users?.nodes[0];
  const posts = data?.posts?.nodes;
  const pageInfo = data?.posts?.pageInfo;

  if (!author) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">
          Autor não encontrado
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        {author.avatar?.url && (
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={author.avatar.url}
              alt={author.name || "Author avatar"}
              className="rounded-full border-2 border-primary-dark"
              fill
              sizes="96px"
            />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900">
            {author.name}
          </h1>
          {author.description && (
            <p className="text-gray-600 mt-2">{author.description}</p>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-serif font-bold mb-6 text-gray-800">
        Artigos de {author.name}
      </h2>

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
                    alt={post.featuredImage.node.altText || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority={index < 2}
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-500">
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
          basePath={`/author/${params.slug}`}
          startCursor={pageInfo.startCursor}
          endCursor={pageInfo.endCursor}
        />
      )}
    </div>
  );
}
