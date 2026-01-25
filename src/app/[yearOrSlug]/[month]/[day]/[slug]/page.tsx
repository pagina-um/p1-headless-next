import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PostHeader } from "@/components/post/PostHeader";
import {
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
  getClient,
} from "@/services/wp-graphql";
import { getPostBySlug } from "@/services/posts";
import { PostContent } from "@/components/post/PostContent";
import { defaultMetadata, makeMetadataObject } from "@/utils/metadata";
import SocialShare from "@/components/post/SocialShare";
import { ArticlePlayer } from "@/components/post/ArticlePlayer";
import { ViewTransition } from "@/components/ui/ViewTransition";

export interface PostPageProps {
  params: Promise<{
    yearOrSlug: string;
    month: string;
    day: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug, day, month, yearOrSlug: year } = await params;
  const { data, error } = await getPostBySlug(slug);

  if (!data?.postBy || !data?.postBy.title || error) {
    return defaultMetadata;
  }

  return makeMetadataObject(data, year, month, day, slug);
}

export async function generateStaticParams() {
  const { data, error } = await getClient().query(
    GET_LATEST_POSTS_FOR_STATIC_GENERATION,
    { first: 50 }
  );

  if (error || !data?.posts) {
    console.log("Error fetching posts:", error);
    return [];
  }

  return data.posts.edges.map((edge) => {
    if (!edge.node.date) {
      return null;
    }
    const date = new Date(edge.node.date);
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, "0"),
      day: date.getDate().toString().padStart(2, "0"),
      slug: edge.node.slug,
    };
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const { data, error } = await getPostBySlug(slug);

  if (!data?.postBy || error) {
    notFound();
  }

  return (
    <ViewTransition>
      <article>
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
          <PostHeader post={data} slug={slug} />
          <ArticlePlayer postId={data.postBy.databaseId} />
          <PostContent
            content={data.postBy?.content || ""}
            shouldInjectDonation={
              !data.postBy.categories?.nodes.some(
                (category) => category.name === "Recensões"
              )
            }
          />
          <div className="mt-8 flex justify-center flex-col mx-auto text-center items-center gap-y-2">
            {" "}
            Partilhe esta notícia nas redes sociais.{" "}
            <SocialShare
              url={"http://paginaum.pt" + (data.postBy.uri || "")}
              description=""
              title={data.postBy.title || ""}
            />
          </div>
        </div>
      </article>
    </ViewTransition>
  );
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;
