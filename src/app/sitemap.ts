import {
  getClient,
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
} from "@/services/wp-graphql";
import { MetadataRoute } from "next";

export const staticPages: MetadataRoute.Sitemap = [
  {
    url: "https://www.paginaum.pt",
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  },
  {
    url: "https://www.paginaum.pt/contactos",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: "https://www.paginaum.pt/ficha-tecnica",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: "https://www.paginaum.pt/politica-de-privacidade",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: "https://www.paginaum.pt/estatuto-editorial",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: "https://www.paginaum.pt/codigo-de-principios",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: "https://www.paginaum.pt/politica-de-correccoes",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    url: "https://www.paginaum.pt/codigo-de-transparencia",
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
];

export async function generateSitemaps() {
  // Fetch the total number of products and calculate the number of sitemaps needed
  return [{ id: 0 }, { id: 1 }];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = "https://www.paginaum.pt";
  let allPosts: MetadataRoute.Sitemap = [];
  let hasNextPage = true;
  let after = null;

  // Fetch all posts using pagination
  while (hasNextPage) {
    const { data }: any = await getClient().query(
      GET_LATEST_POSTS_FOR_STATIC_GENERATION,
      { first: 100, after }, // Fetch 100 posts at a time
      { requestPolicy: "network-only" }
    );

    const edges = data?.posts?.edges ?? [];
    const pageInfo = data?.posts?.pageInfo;

    // Map posts to sitemap entries
    const posts = edges
      .map((edge: any) => {
        if (!edge.node.date) {
          return null;
        }
        const date = new Date(edge.node.date);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const slug = edge.node.slug;

        return {
          url: `${BASE_URL}/${year}/${month}/${day}/${slug}`,
          lastModified: edge.node.modified || "",
          changeFrequency: "monthly" as const,
          priority: 0.7,
          title: edge.node.title,
        };
      })
      .filter((item: any) => item !== null);

    // Add posts to the allPosts array
    allPosts = allPosts.concat(posts);

    // Update pagination variables
    hasNextPage = pageInfo?.hasNextPage ?? false;
    after = pageInfo?.endCursor ?? null;
  }

  // Map posts to sitemap entries with news metadata
  const postEntries: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: post.url,
    lastModified: new Date(post.lastModified as any),
    changeFrequency: post.changeFrequency,
    priority: post.priority,
  }));

  // Combine static pages and post entries
  return id === 0
    ? [...staticPages, ...postEntries]
    : transformToGoogleNews(postEntries);
}

function transformToGoogleNews(posts: MetadataRoute.Sitemap) {
  return posts.slice(0, 30).map((post: any) => ({
    ...post,
    news: {
      publication: {
        name: "Página Um",
        language: "pt",
      },
      publication_date: new Date(post.lastModified).toISOString(),
      title: post.title,
    },
  }));
}
