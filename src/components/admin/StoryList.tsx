import React from 'react';
import { Story } from '../../types';
import { Plus } from 'lucide-react';
import { CategoryBlockCreator } from './CategoryBlockCreator';
import { WPPostsList } from './WPPostsList';
import type { WPPost } from '../../types/wordpress';
import { convertWPPostToStory } from '../../utils/wpUtils';

interface StoryListProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  selectedStoryId?: string;
  onCreateCategoryBlock?: (categoryId: number, title: string) => void;
  wpPosts?: WPPost[];
}

export function StoryList({ 
  stories, 
  onSelectStory, 
  selectedStoryId,
  onCreateCategoryBlock,
  wpPosts = []
}: StoryListProps) {
  const handlePostSelect = (post: WPPost) => {
    const story = convertWPPostToStory(post);
    onSelectStory(story);
  };

  return (
    <div className="space-y-6">
      {/* WordPress Posts Section */}
      {wpPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Latest Posts</h2>
          <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2 space-y-2">
            {wpPosts.map(post => (
              <div
                key={post.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedStoryId === `wp-${post.id}`
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handlePostSelect(post)}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 
                    className="font-medium text-sm line-clamp-2" 
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
                  />
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1 flex-shrink-0">
                    <Plus className="w-3 h-3" />
                    Add
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Blocks Section */}
      {onCreateCategoryBlock && (
        <CategoryBlockCreator onCreateBlock={onCreateCategoryBlock} />
      )}
    </div>
  );
}