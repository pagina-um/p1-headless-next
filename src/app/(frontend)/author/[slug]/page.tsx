import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/categoryUtils";
import { Calendar } from "lucide-react";
import { Metadata } from "next";
import { PayloadPost, Author, Media, getPostImageUrl, getPostImageAlt } from "@/types";
import { decodeHtmlEntities } from "@/utils/utils";

// Enable ISR with 1 hour revalidation for better caching
export const revalidate = 3600;

async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "authors",
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  });

  return (result.docs[0] as Author) || null;
}

async function getPostsByAuthor(
  authorId: number,
  page: number,
  postsPerPage: number
) {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "posts",
    where: {
      author: { equals: authorId },
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
  const author = await getAuthorBySlug(slug);

  const authorName = author?.name || "Autor";
  const title = `${authorName} - Página Um`;
  const description = author?.bio || `Artigos de ${authorName}. Jornalismo independente que só depende dos leitores.`;
  const url = `https://paginaum.pt/author/${slug}`;

  return {
    title,
    description,
    openGraph: {
      type: "profile",
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

export default async function AuthorPage({
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

  const author = await getAuthorBySlug(slug);

  if (!author) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">
          Autor não encontrado
        </h1>
      </div>
    );
  }

  const { posts, hasNextPage, totalPages } = await getPostsByAuthor(
    author.id,
    currentPage,
    postsPerPage
  );

  // Get avatar URL from Payload media or fallback fields
  const avatarUrl = author.avatar && typeof author.avatar === "object"
    ? (author.avatar as Media).url
    : author.wpAvatarUrl || author.gravatarUrl || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        {avatarUrl && (
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={avatarUrl}
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
          {author.bio && (
            <p className="text-gray-600 mt-2">{author.bio}</p>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-serif font-bold mb-6 text-gray-800">
        Artigos de {author.name}
      </h2>

      {posts.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">
            Este autor ainda não tem artigos publicados.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => {
              const imageUrl = getPostImageUrl(post);
              const imageAlt = getPostImageAlt(post);

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
                      <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                        {decodeHtmlEntities(post.title)}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
            basePath={`/author/${slug}`}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
