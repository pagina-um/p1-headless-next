import React from "react";
import { Story } from "../../types";
import { User, Calendar } from "lucide-react";

interface NewsStoryProps {
  story: Story;
}

export function NewsStory({ story }: NewsStoryProps) {
  return (
    <div className="relative h-full overflow-hidden  shadow-lg group">
      <img
        src={story.imageUrl}
        alt={story.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="absolute bottom-0 p-6 text-white">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
            {story.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {story.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(story.publishedAt).toLocaleDateString("pt-PT")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
