import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { PostHeader } from "@/components/post/PostHeader";
import { PostFooter } from "@/components/post/PostFooter";
import { PostLoadingUI } from "@/components/post/PostLoadingUi";
import { PostContent } from "@/components/post/PostContent";
import { defaultMetadata } from "@/utils/metadata";
import SocialShare from "@/components/post/SocialShare";
import { ArticleSupportModal } from "@/components/post/ArticleSupportModal";
import { StructuredData } from "@/components/StructuredData";
import { EditPostButton } from "@/components/post/EditPostButton";
import { richTextToHtml } from "@/utils/richTextConversion";
import { Post, Category, Tag, getPostImageUrl, getPostImageAlt } from "@/types";

export interface PostPageProps {
  params: Promise<{
    yearOrSlug: string;
    month: string;
    day: string;
    slug: string;
  }>;
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "posts",
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    depth: 2,
  });

  return result.docs[0] || null;
}

async function getLatestPosts(limit: number = 50) {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "posts",
    where: {
      status: { equals: "publish" },
    },
    limit,
    sort: "-publishedAt",
    depth: 1,
  });

  return result.docs;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug, day, month, yearOrSlug: year } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return defaultMetadata;
  }

  const imageUrl = getPostImageUrl(post);
  const imageAlt = getPostImageAlt(post);
  const authorName = typeof post.author === "object" ? post.author?.name : undefined;

  return {
    title: post.title || "Página Um",
    description: post.chamadaDestaque || "O jornalismo independente só depende dos leitores.",
    openGraph: {
      title: post.title || "Página Um",
      description: post.chamadaDestaque || "O jornalismo independente só depende dos leitores.",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: authorName ? [authorName] : undefined,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: imageAlt || post.title || "Página Um",
            },
          ]
        : undefined,
      url: `https://paginaum.pt/${year}/${month}/${day}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title || "Página Um",
      description: post.chamadaDestaque || "",
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `https://paginaum.pt/${year}/${month}/${day}/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getLatestPosts(50);

  return posts
    .filter((post) => post.publishedAt)
    .map((post) => {
      const date = new Date(post.publishedAt);
      return {
        yearOrSlug: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        day: date.getDate().toString().padStart(2, "0"),
        slug: post.slug,
      };
    });
}

async function PostComponent({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Convert rich text content to HTML
  const htmlContent = post.content ? await richTextToHtml(post.content) : "";

  // Get post URL
  const postUrl = `https://paginaum.pt${post.uri || ""}`;

  // Get first category for breadcrumb (use imported Category type)
  const categories = (post.categories || []).filter(
    (c): c is Category => typeof c === "object" && c !== null
  );
  const firstCategory = categories[0];

  // Get tags (use imported Tag type)
  const tags = (post.tags || []).filter(
    (t): t is Tag => typeof t === "object" && t !== null
  );

  // Generate structured data
  const imageUrl = getPostImageUrl(post);
  const authorName = typeof post.author === "object" ? post.author?.name : "Página Um";

  const newsArticleSchema = {
    "@context": "https://schema.org" as const,
    "@type": "NewsArticle" as const,
    headline: post.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: [{ "@type": "Person" as const, name: authorName }],
    publisher: {
      "@type": "Organization" as const,
      name: "Página Um",
      logo: {
        "@type": "ImageObject" as const,
        url: "https://paginaum.pt/logo.png",
      },
    },
    description: post.chamadaDestaque || post.excerpt,
    articleSection: firstCategory?.name,
    keywords: tags.map((t) => t.name),
    mainEntityOfPage: {
      "@type": "WebPage" as const,
      "@id": postUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: "https://paginaum.pt",
      },
      ...(firstCategory
        ? [
            {
              "@type": "ListItem" as const,
              position: 2,
              name: firstCategory.name,
              item: `https://paginaum.pt/cat/${firstCategory.slug || firstCategory.id}`,
            },
          ]
        : []),
      {
        "@type": "ListItem" as const,
        position: firstCategory ? 3 : 2,
        name: post.title,
      },
    ],
  };

  return (
    <>
      <StructuredData data={[newsArticleSchema, breadcrumbSchema]} />
      <article>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <PostHeader post={post} />
          <PostContent content={htmlContent} />
          <div className="mt-8 flex justify-center flex-col mx-auto text-center items-center gap-y-2">
            Partilhe esta notícia nas redes sociais.
            <SocialShare
              url={postUrl}
              description=""
              title={post.title}
            />
          </div>
        </div>
      </article>
      <EditPostButton postId={String(post.id)} />
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
