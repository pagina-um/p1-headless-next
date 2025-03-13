import { MetadataRoute } from "next";
import { getClient, GET_ALL_PAGES } from "@/services/wp-graphql";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all WordPress pages
  const { data } = await getClient().query(GET_ALL_PAGES, {});
  
  const BASE_URL = "https://www.paginaum.pt";
  const pages = data?.pages?.nodes || [];
  
  return pages
    .filter(page => page.uri && !page.uri.includes('/')) // Only include top-level pages
    .map(page => ({
      url: `${BASE_URL}/${page.uri}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
}