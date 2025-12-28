import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/categoryUtils";
import { Calendar, User, Search } from "lucide-react";
import { Metadata } from "next";
import { PayloadPost, getPostImageUrl, getPostImageAlt } from "@/types";
import { decodeHtmlEntities } from "@/utils/utils";

async function searchPosts(query: string, page: number, postsPerPage: number) {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "posts",
    where: {
      or: [
        { title: { contains: query } },
        { antetitulo: { contains: query } },
        { chamadaDestaque: { contains: query } },
        { chamadaManchete: { contains: query } },
      ],
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
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const searchParamsResolved = await searchParams;
  const query = searchParamsResolved.q || "";

  const title = query
    ? `Pesquisa: ${query} - Página Um`
    : "Pesquisa - Página Um";
  const description = query
    ? `Resultados de pesquisa para "${query}" na Página Um. Jornalismo independente que só depende dos leitores.`
    : "Pesquise artigos na Página Um. Jornalismo independente que só depende dos leitores.";

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const searchParamsResolved = await searchParams;
  const query = searchParamsResolved.q || "";
  const currentPage = Number(searchParamsResolved.page) || 1;
  const postsPerPage = 12;

  // If no search query is provided, show an empty state
  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Search className="mr-2" />
          <h1 className="text-4xl font-serif font-bold text-gray-900">
            Pesquisa
          </h1>
        </div>
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-medium mb-4">
            Escreva um termo de pesquisa para encontrar artigos.
          </h2>
          <p className="text-gray-600">
            Use a barra de pesquisa acima para encontrar artigos relacionados.
          </p>
        </div>
      </div>
    );
  }

  const { posts, hasNextPage, totalPages } = await searchPosts(
    query,
    currentPage,
    postsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Search className="mr-2" />
        <h1 className="text-4xl font-serif font-bold text-gray-900">
          Artigos relacionados com: <span className="italic">"{query}"</span>
        </h1>
      </div>

      {posts.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-medium mb-4">
            Não foram encontrados resultados.
          </h2>
          <p className="text-gray-600">
            Tente outro termo ou pesquise por categoria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const imageUrl = getPostImageUrl(post);
              const imageAlt = getPostImageAlt(post);
              const authorName = typeof post.author === "object" ? post.author?.name : undefined;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={imageUrl}
                        alt={imageAlt || post.title || "Post image"}
                        fill
                        sizes="(max-width: 768px) 30vw, (max-width: 1200px) 30vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">
                      <Link
                        href={post.uri || `/post/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {decodeHtmlEntities(post.title)}
                      </Link>
                    </h2>
                    <div
                      className="text-gray-700 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html:
                          post.chamadaManchete ||
                          post.chamadaDestaque ||
                          post.antetitulo ||
                          "",
                      }}
                    />
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {post.publishedAt ? formatDate(post.publishedAt) : "No date"}
                        </span>
                      </div>
                      {authorName && (
                        <Link
                          href={typeof post.author === "object" && post.author?.slug ? `/author/${post.author.slug}` : "#"}
                          className="flex items-center hover:text-primary transition-colors"
                        >
                          <User className="w-4 h-4 mr-1" />
                          <span>{authorName}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            basePath={`/search?q=${encodeURIComponent(query)}`}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
