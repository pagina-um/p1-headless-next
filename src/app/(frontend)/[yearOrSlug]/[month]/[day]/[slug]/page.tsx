import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PostHeader } from "@/components/post/PostHeader";
import { PostFooter } from "@/components/post/PostFooter";
import { PostLoadingUI } from "@/components/post/PostLoadingUi";
import { getPostBySlug as getPostBySlugPayload, getLatestPosts } from "@/services/payload-api";
import { PostContent } from "@/components/post/PostContent";
import { defaultMetadata, makeMetadataObject } from "@/utils/metadata";
import SocialShare from "@/components/post/SocialShare";
import { ArticleSupportModal } from "@/components/post/ArticleSupportModal";

export interface PostPageProps {
  params: Promise<{
    yearOrSlug: string;
    month: string;
    day: string;
    slug: string;
  }>;
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await getPostBySlugPayload(slug);
  return { data, error };
}

export type PostBySlugData = NonNullable<
  Awaited<ReturnType<typeof getPostBySlug>>
>;

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
  const { data, error } = await getLatestPosts(50);

  if (error || !data?.posts) {
    console.log("Error fetching posts:", error);
    return [];
  }

  return data.posts.nodes.map((post: any) => {
    if (!post.date) {
      return null;
    }
    const date = new Date(post.date);
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, "0"),
      day: date.getDate().toString().padStart(2, "0"),
      slug: post.slug,
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
    </>
  );
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<PostLoadingUI />}>
      <PostComponent slug={slug} />
    </Suspense>
  );
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;
