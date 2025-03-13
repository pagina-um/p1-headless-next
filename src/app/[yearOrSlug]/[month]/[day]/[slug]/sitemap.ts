import {
  getClient,
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
} from "@/services/wp-graphql";
import { MetadataRoute } from "next";

export async function generateSitemaps() {
  return [{ id: 0 }];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const { data } = await getClient().query(
    GET_LATEST_POSTS_FOR_STATIC_GENERATION,
    { first: 3500 } // seems like a reasonable number, way above the number of posts we have
  );

  const edges = data?.posts?.edges ?? [];
  return edges
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
      
      // Calculate priority based on post date (newer posts get higher priority)
      const now = new Date();
      const ageInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      let priority = 0.9;

      // Gradually reduce priority for older posts
      if (ageInDays > 7) priority = 0.8; // Older than a week
      if (ageInDays > 30) priority = 0.7; // Older than a month
      if (ageInDays > 90) priority = 0.6; // Older than 3 months
      if (ageInDays > 365) priority = 0.5; // Older than a year
      
      return {
        url: `${BASE_URL}/${year}/${month}/${day}/${slug}`,
        lastModified: edge.node.modified || date.toISOString(),
        changeFrequency: ageInDays < 7 ? 'daily' : 
                       ageInDays < 30 ? 'weekly' : 
                       ageInDays < 90 ? 'monthly' : 'yearly' as any,
        priority
      };
    })
    .filter((item) => item !== null);
}
