import { MetadataRoute } from "next";
import { getClient } from "@/services/wp-graphql";
import { graphql } from "gql.tada";

const GET_ALL_CATEGORIES = graphql(`
  query GetAllCategories {
    categories(first: 100) {
      nodes {
        id
        name
        slug
      }
    }
  }
`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all categories
  const { data } = await getClient().query(GET_ALL_CATEGORIES, {});
  
  const BASE_URL = "https://www.paginaum.pt";
  const categories = data?.categories?.nodes || [];
  
  return categories.map((category) => ({
    url: `${BASE_URL}/cat/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));
}