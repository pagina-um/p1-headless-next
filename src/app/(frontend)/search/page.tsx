import { searchPosts } from "@/services/payload-api";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/categoryUtils";
import { Calendar, User, Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; after?: string }>;
}) {
  const searchParamsResolved = await searchParams;
  const query = searchParamsResolved.q || "";
  const currentPage = Number(searchParamsResolved.page) || 1;
  const postsPerPage = 12; // Consistent with other pages

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

  const { data } = await searchPosts(query, postsPerPage);

  const posts = data?.posts?.nodes || [];
  const pageInfo = data?.posts?.pageInfo;

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
            {posts.map((post: any) => {
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {post.featuredImage?.node?.sourceUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.featuredImage.node.sourceUrl}
                        alt={
                          post.featuredImage.node.altText ||
                          post.title ||
                          "Post image"
                        }
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
                        {post.title}
                      </Link>
                    </h2>
                    <div
                      className="text-gray-700 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html:
                          post.postFields.chamadaManchete ||
                          post.postFields.chamadaDestaque ||
                          post.postFields.antetitulo ||
                          "",
                      }}
                    />
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {post.date ? formatDate(post.date) : "No date"}
                        </span>
                      </div>
                      {post.author?.node?.name && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>{post.author.node.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {pageInfo && (
            <Pagination
              currentPage={currentPage}
              hasNextPage={pageInfo.hasNextPage}
              basePath={`/search?q=${encodeURIComponent(query)}`}
              startCursor={pageInfo.startCursor}
              endCursor={pageInfo.endCursor}
            />
          )}
        </>
      )}
    </div>
  );
}
