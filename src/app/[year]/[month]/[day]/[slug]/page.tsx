// app/[year]/[month]/[day]/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PostHeader } from "@/components/post/PostHeader";
import { PostFooter } from "@/components/post/PostFooter";
import { PostLoadingUI } from "@/components/post/PostLoadingUi";
import {
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
  GET_POST_BY_SLUG,
  getClient,
} from "@/services/wp-graphql";
import { PostContent } from "@/components/post/PostContent";

interface PostPageProps {
  params: {
    year: string;
    month: string;
    day: string;
    slug: string;
  };
}

// Validate and generate static paths
export async function generateStaticParams() {
  const { data, error } = await getClient().query(
    GET_LATEST_POSTS_FOR_STATIC_GENERATION,
    {}
  );

  if (error || !data?.posts) {
    console.log("Error fetching posts:", error);
    // Note: In Next.js 13+/14, we just return an empty array instead of the old
    // { paths: [], fallback: true } format
    return [];
  }

  // Map the posts data to the format Next.js expects
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

async function getPostBySlug(slug: string) {
  const { data, error } = await getClient().query(GET_POST_BY_SLUG, {
    slug,
  });
  return { data, error };
}

export type PostBySlugData = NonNullable<
  Awaited<ReturnType<typeof getPostBySlug>>
>;

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
