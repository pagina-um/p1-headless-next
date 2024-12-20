import { WPCategory, WPPost } from "../types/wordpress";

const API_BASE_URL = "https://p1-git.local/wp-json/wp/v2";

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
