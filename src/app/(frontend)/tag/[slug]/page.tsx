import { getPostsByTagSlug } from "@/services/payload-api";
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getPostsByTagSlug(slug, 1);

  const tag = data?.tags?.nodes[0];
  const tagName = tag?.name || "Tag";

  const title = `${tagName} - Página Um`;
  const description = `Descubra os artigos sobre ${tagName}. Jornalismo independente que só depende dos leitores.`;
  const url = `https://paginaum.pt/tag/${slug}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Página Um",
      images: [
        {
          url: "https://paginaum.pt/icon.png",
          width: 512,
          height: 512,
          alt: "Página Um",
        },
      ],
      locale: "pt_PT",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["https://paginaum.pt/icon.png"],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; after?: string }>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const currentPage = Number(searchParamsResolved.page) || 1;
  const postsPerPage = 12; // Increased for grid layout

  const afterCursor = searchParamsResolved.after
    ? decodeURIComponent(searchParamsResolved.after)
    : undefined;

  const { data, error } = await getPostsByTagSlug(
    slug,
    postsPerPage,
    afterCursor
  );

  const tag = data?.tags?.nodes[0];
  const posts = data?.posts?.nodes;
  const pageInfo = data?.posts?.pageInfo;

  if (error) {
    return <div>Error: {error}</div>;
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
              <div className="p-6">
                <h2 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>

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
          basePath={`/tag/${slug}`}
          startCursor={pageInfo.startCursor}
          endCursor={pageInfo.endCursor}
        />
      )}
    </div>
  );
}
