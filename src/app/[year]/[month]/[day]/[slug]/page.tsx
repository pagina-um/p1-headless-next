import { notFound } from "next/navigation";
import { PostHeader } from "@/components/post/PostHeader";
import { PostContent } from "@/components/post/PostContent";
import { PostFooter } from "@/components/post/PostFooter";
import { getPost, getPostPaths } from "@/services/wordpress";
import type { WPPost } from "@/types/wordpress";

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
  const paths = await getPostPaths();
  return paths;
}

async function getPostData(slug: string): Promise<WPPost | null> {
  try {
    return await getPost(slug);
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostData(params.slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <PostHeader post={post} />
      <PostContent content={post.content.rendered} />
      <PostFooter post={post} />
    </article>
  );
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;
