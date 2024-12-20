import { WPPost } from '../../types/wordpress';
import { API_BASE_URL } from '../config';
import { handleApiResponse } from './utils';

export async function getLatestPosts(page: number = 1, perPage: number = 10): Promise<WPPost[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?page=${page}&per_page=${perPage}&_embed`
    );
    return handleApiResponse<WPPost[]>(response);
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
}