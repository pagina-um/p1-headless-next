import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PostHeader } from "@/components/post/PostHeader";
import { PostFooter } from "@/components/post/PostFooter";
import { PostLoadingUI } from "@/components/post/PostLoadingUi";
import {
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
  GET_POST_BY_SLUG,
  getClient,
} from "@/services/wp-graphql";
import { PostContent } from "@/components/post/PostContent";
import { defaultMetadata, makeMetadataObject } from "@/utils/metadata";

export interface PostPageProps {
  params: {
    year: string;
    month: string;
    day: string;
    slug: string;
  };
}

async function getPostBySlug(slug: string) {
  const { data, error } = await getClient().query(GET_POST_BY_SLUG, {
    slug,
  });
  return { data, error };
}

export type PostBySlugData = NonNullable<
  Awaited<ReturnType<typeof getPostBySlug>>
>;

// Metadata generation for the post
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { data, error } = await getPostBySlug(params.slug);

  if (!data?.postBy || !data?.postBy.title || error) {
    return defaultMetadata;
  }

  return makeMetadataObject(data, params);
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

async function PostComponent({ slug }: { slug: string }) {
  const { data, error } = await getPostBySlug(slug);
  if (!data?.postBy || error) {
    notFound();
  }

  return (
    <>
      <article>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <PostHeader post={data} />
          <PostContent content={data.postBy?.content || ""} />
        </div>
      </article>
      <PostFooter />
    </>
  );
}

export default function PostPage({ params }: PostPageProps) {
  return (
    <Suspense fallback={<PostLoadingUI />}>
      <PostComponent slug={params.slug} />
    </Suspense>
  );
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;
