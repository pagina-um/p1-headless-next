import { WPCategory, WPPost } from '../../types/wordpress';
import { API_BASE_URL } from '../config';
import { handleApiResponse } from './utils';

export async function getCategories(): Promise<WPCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories?per_page=100`);
    return handleApiResponse<WPCategory[]>(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getPostsByCategory(categoryId: number): Promise<WPPost[]> {
  if (!categoryId) {
    console.error('Invalid category ID:', categoryId);
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?categories=${categoryId}&per_page=5&_embed`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await handleApiResponse<WPPost[]>(response);
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryId}:`, error);
    return [];
  }
}