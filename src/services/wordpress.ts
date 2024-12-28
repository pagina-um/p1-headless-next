import { WPCategory, WPPost, WPPostById } from "../types/wordpress";

const API_BASE_URL = "https://p1-git.local/wp-json/wp/v2";
export const GQL_URL = "https://p1-git.local/graphql";

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?slug=${slug}&_embed`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const posts = await response.json();
    return posts[0] || null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function getPostPaths() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?_fields=slug,date&per_page=100`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const posts = await response.json();

    return posts.map((post: WPPost) => {
      const date = new Date(post.date);
      return {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        day: date.getDate().toString().padStart(2, "0"),
        slug: post.slug,
      };
    });
  } catch (error) {
    console.error("Error fetching post paths:", error);
    return [];
  }
}
