"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { FEATURES } from "@/config/features";

type PlayerState = "loading" | "ready" | "playing" | "hidden";

interface ArticlePlayerProps {
  postId: number;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function ArticlePlayer({ postId }: ArticlePlayerProps) {
  const [state, setState] = useState<PlayerState>("loading");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Check cache on mount
  useEffect(() => {
    async function checkCache() {
      try {
        const res = await fetch(`/api/tts?postId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cached) {
            setAudioUrl(data.url);
            setDuration(data.durationSeconds);
            setState("ready");
            return;
          }
        }
      } catch {
        // Network error — hide
      }
      setState("hidden");
    }
    checkCache();
  }, [postId]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const pct = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setState("ready");
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
  }, [audioUrl]);

  function handlePlayPause() {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (state === "playing") {
      audio.pause();
      setState("ready");
    } else {
      audio.play();
      setState("playing");
    }
  }

  function handleProgressBarClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!progressBarRef.current || !audioRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percentageClicked = (clickPosition / rect.width) * 100;
    const newTime = (percentageClicked / 100) * (audioRef.current.duration || duration);

    audioRef.current.currentTime = newTime;
    setProgress(percentageClicked);
    setCurrentTime(newTime);
  }

  if (!FEATURES.TTS_ENABLED || state === "hidden" || state === "loading") return null;

  return (
    <div className="mt-3 mb-0 md:mt-4 md:mb-0 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs text-gray-500 mb-2 font-medium">Ouvir artigo (experimental)</p>
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          className="flex-shrink-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label={state === "playing" ? "Pausar" : "Reproduzir"}
        >
          {state === "playing" ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div
            ref={progressBarRef}
            className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </div>
  );
}
