import React, { useState, useEffect } from 'react';
import { WPPost } from '../../types/wordpress';
import { WPPostsList } from './WPPostsList';
import { getLatestPosts } from '../../services/wordpress';

interface StoriesListProps {
  onSelectPost: (post: WPPost) => void;
}

export function StoriesList({ onSelectPost }: StoriesListProps) {
  const [wpPosts, setWpPosts] = useState<WPPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getLatestPosts();
      setWpPosts(posts);
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Notícias</h2>
      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
        <WPPostsList 
          posts={wpPosts} 
          onSelectPost={onSelectPost}
        />
      </div>
    </div>
  );
}