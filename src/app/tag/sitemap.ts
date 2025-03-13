import { MetadataRoute } from "next";
import { getClient } from "@/services/wp-graphql";
import { graphql } from "gql.tada";

const GET_ALL_TAGS = graphql(`
  query GetAllTags {
    tags(first: 100) {
      nodes {
        id
        name
        slug
      }
    }
  }
`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all tags
  const { data } = await getClient().query(GET_ALL_TAGS, {});
  
  const BASE_URL = "https://www.paginaum.pt";
  const tags = data?.tags?.nodes || [];
  
  return tags.map((tag) => ({
    url: `${BASE_URL}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
}