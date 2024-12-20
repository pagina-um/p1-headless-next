import { useState, useEffect } from 'react';
import { WPPost } from '../types/wordpress';
import { getPostsByCategory } from '../services/wordpress';

export function useCategoryPosts(categoryId: number, postsPerPage: number = 5) {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const categoryPosts = await getPostsByCategory(categoryId, postsPerPage);
        
        if (mounted) {
          setPosts(categoryPosts);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in useCategoryPosts:', err);
        if (mounted) {
          setError('Failed to load category posts');
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, [categoryId, postsPerPage]);

  return { posts, loading, error };
}