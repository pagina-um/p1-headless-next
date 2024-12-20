import { WPPost, WPCategory } from '../types/wordpress';
import { Story, Category } from '../types';

export function convertWPPostToStory(post: WPPost): Story {
  // Get the featured image URL from the _embedded data
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const imageUrl = featuredImage?.source_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';
  
  // Get the author name
  const author = post._embedded?.author?.[0]?.name || 'Unknown Author';

  // Get the first category if available
  const category = post.categories?.[0] || 'news';

  return {
    id: `wp-${post.id}`,
    title: post.title.rendered.replace(/&#8216;|&#8217;/g, "'").replace(/&amp;/g, "&"),
    content: post.content.rendered,
    excerpt: post.excerpt.rendered || '',
    imageUrl,
    author,
    publishedAt: post.date,
    category: category as Category,
  };
}

export function sanitizeWPCategory(category: WPCategory): Category {
  return category.slug as Category;
}