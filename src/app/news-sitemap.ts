import {
  getClient,
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
} from "@/services/wp-graphql";
import { MetadataRoute } from "next";

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
        news: {
          publication: {
            name: "Página Um",
            language: "pt",
          },
          publication_date: date.toISOString(),
          title: edge.node.title,
        },
      };
    })
    .filter((item) => item !== null);

  return allPosts;
}
