import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/categoryUtils";
import { Calendar, User } from "lucide-react";
import { ArticleSupportModal } from "@/components/post/ArticleSupportModal";
import { Metadata } from "next";
import { PayloadPost, PayloadCategory, getPostImageUrl, getPostImageAlt } from "@/types";

// Enable ISR with 1 hour revalidation for better caching
export const revalidate = 3600;

async function getCategoryBySlug(slug: string): Promise<PayloadCategory | null> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "categories",
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  });

  return (result.docs[0] as PayloadCategory) || null;
}

async function getPostsByCategory(
  categoryId: number,
  page: number,
  postsPerPage: number
) {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "posts",
    where: {
      categories: { in: [categoryId] },
      status: { equals: "publish" },
    },
    limit: postsPerPage,
    page,
    sort: "-publishedAt",
    depth: 2,
  });

  return {
    posts: result.docs as PayloadPost[],
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    totalPages: result.totalPages,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  const categoryName = category?.name || "Categoria";
  const title = `${categoryName} - Página Um`;
  const description = `Explore os artigos na categoria ${categoryName}. Jornalismo independente que só depende dos leitores.`;
  const url = `https://paginaum.pt/cat/${slug}`;

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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const currentPage = Number(searchParamsResolved.page) || 1;
  const postsPerPage = 12;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">
          Categoria não encontrada
        </h1>
      </div>
    );
  }

  const { posts, hasNextPage, hasPrevPage, totalPages } = await getPostsByCategory(
    category.id,
    currentPage,
    postsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">
        {category.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => {
          const imageUrl = getPostImageUrl(post);
          const imageAlt = getPostImageAlt(post);
          const authorName = typeof post.author === "object" ? post.author?.name : undefined;

          return (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <Link href={post.uri || `/${post.slug}`} className="block">
                {imageUrl && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={imageAlt || post.title}
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
                    {authorName && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {authorName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        basePath={`/cat/${slug}`}
        totalPages={totalPages}
      />
    </div>
  );
}
