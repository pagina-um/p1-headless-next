"use client";
import React, { useState } from "react";
import { Mic, Play, Pause, Clock, Calendar } from "lucide-react";
import { formatDate } from "../../utils/categoryUtils";

interface Episode {
  id: number;
  title: string;
  duration: string;
  date: string;
  description: string;
  audioUrl: string;
}

interface PodcastBlockProps {
  title: string;
  episodes: Episode[];
}

export function PodcastBlock({ title, episodes }: PodcastBlockProps) {
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (episode: Episode) => {
    if (activeEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveEpisode(episode);
      setIsPlaying(true);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-2xl font-bold">{title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-4">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className={`p-4 rounded-lg transition-colors ${
                activeEpisode?.id === episode.id
                  ? "bg-primary/5 border-primary/10"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => togglePlay(episode)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    activeEpisode?.id === episode.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-primary/10"
                  }`}
                >
                  {activeEpisode?.id === episode.id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight mb-1">
                    {episode.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {episode.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {episode.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(episode.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeEpisode && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: isPlaying ? "60%" : "0%" }}
              />
            </div>
            <span className="text-sm text-gray-500">
              {activeEpisode.duration}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
