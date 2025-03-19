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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all articles
  const { data, error } = await getClient().query(
    GET_LATEST_POSTS_FOR_STATIC_GENERATION,
    { first: 3500 }, // seems like a reasonable number, way above the number of posts we have
    { requestPolicy: "cache-and-network" }
  );
  const edges = data?.posts?.edges ?? [];
  const allPosts = edges
    .map((edge) => {
      if (!edge.node.date) {
        return null;
      }
      const date = new Date(edge.node.date);

      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const slug = edge.node.slug;
      const BASE_URL = "https://www.paginaum.pt";

      return {
        url: `${BASE_URL}/${year}/${month}/${day}/${slug}`,
        lastModified: edge.node.modified || "",
        slug: edge.node.slug,
      };
    })
    .filter((item) => item !== null);
  const postEntries: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `https://www.paginaum.pt/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "never" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postEntries];
}
