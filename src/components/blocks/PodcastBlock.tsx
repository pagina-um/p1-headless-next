"use client";
import React, { useEffect, useRef, useState } from "react";
import { Mic, Play, Pause, Clock, Calendar } from "lucide-react";
import { formatDate } from "../../utils/categoryUtils";
import { Episode, PodcastFeed, safeParsePodcastFeed } from "@/utils/podcast";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function PodcastBlock() {
  const { feed, isLoading, error } = usePodcastFeed(
    "https://anchor.fm/s/bfa992b8/podcast/rss"
  );
  const title = "Podcast";
  const episodes = feed?.episodes.slice(0, 10) || [];
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Handle audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const progress = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(progress) ? 0 : progress);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef.current]);

  // Handle episode changes
  useEffect(() => {
    if (activeEpisode && audioRef.current) {
      audioRef.current.src = activeEpisode.enclosure.url || "";
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [activeEpisode]);

  const handleEpisodeClick = (episode: Episode) => {
    if (activeEpisode?.guid === episode.guid) {
      // Toggle play/pause for current episode
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Start new episode
      setActiveEpisode(episode);
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percentageClicked = (clickPosition / rect.width) * 100;
    const newTime = (percentageClicked / 100) * duration;

    audioRef.current.currentTime = newTime;
    setProgress(percentageClicked);
    setCurrentTime(newTime);
  };

  return (
    <div className="max-lg:max-h-80 max-lg:overflow-scroll  lg:h-full flex flex-col">
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
              key={episode.guid}
              className={`p-4 transition-colors cursor-pointer ${
                activeEpisode?.guid === episode.guid
                  ? "bg-primary/5 border-primary/10"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleEpisodeClick(episode)}
            >
              <div className="flex items-start gap-3">
                <button
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    activeEpisode?.guid === episode.guid
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-primary/10"
                  }`}
                >
                  {activeEpisode?.guid === episode.guid && isPlaying ? (
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
                    {stripHtmlTags(episode.description)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {episode.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(episode.pubDate || "")}
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
          <div className="flex flex-col gap-2">
            {/* Progress bar with click handling */}
            <div
              ref={progressBarRef}
              className="w-full h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
              onClick={handleProgressBarClick}
            >
              <div
                className="h-full bg-primary rounded-full transition-transform duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Time display */}
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
export function usePodcastFeed(feedUrl: string) {
  const [feed, setFeed] = useState<PodcastFeed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(feedUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();
        const result = safeParsePodcastFeed(xmlText);

        if (isMounted) {
          if (result.success && result.data) {
            setFeed(result.data);
          } else {
            setError(result.error || "Failed to parse feed");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch feed");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeed();

    return () => {
      isMounted = false;
    };
  }, [feedUrl]);

  return { feed, isLoading, error };
}

function stripHtmlTags(html: string | null): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}
