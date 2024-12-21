import { WPCategory, WPPost, WPPostById } from "../types/wordpress";

const API_BASE_URL = "https://p1-git.local/wp-json/wp/v2";

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

export async function getPostById(id: string): Promise<WPPostById | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/${id.split("wp-")[1]}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const post = await response.json();
    return post || null;
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

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.text();
    console.error("API Error:", error);
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
};

export async function getCategories(): Promise<WPCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories?per_page=100`);
    return handleResponse<WPCategory[]>(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getPostsByCategory(
  categoryId: number,
  postsPerPage: number = 5
): Promise<WPPost[]> {
  if (!categoryId) {
    console.error("Invalid category ID:", categoryId);
    return [];
  }

  try {
    console.log(`Fetching ${postsPerPage} posts for category ${categoryId}`);
    const response = await fetch(
      `${API_BASE_URL}/posts?categories=${categoryId}&per_page=${postsPerPage}&_embed`
    );
    const posts = await handleResponse<WPPost[]>(response);
    console.log(`Received ${posts.length} posts for category ${categoryId}`);
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryId}:`, error);
    return [];
  }
}

export async function getLatestPosts(
  page: number = 1,
  perPage: number = 10
): Promise<WPPost[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?page=${page}&per_page=${perPage}&_embed`
    );
    return handleResponse<WPPost[]>(response);
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
}
