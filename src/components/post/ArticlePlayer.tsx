"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";

type PlayerState = "idle" | "generating" | "ready" | "playing" | "error";

interface ArticlePlayerProps {
  postId: number;
  slug: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function ArticlePlayer({ postId, slug }: ArticlePlayerProps) {
  const [state, setState] = useState<PlayerState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          }
        }
      } catch {
        // Not cached, stay idle
      }
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

    const handleError = () => {
      setState("error");
      setErrorMessage("Erro ao reproduzir áudio");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrl]);

  async function handleGenerate() {
    setState("generating");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao gerar áudio");
      }

      const data = await res.json();
      setAudioUrl(data.url);
      setDuration(data.durationSeconds);
      setState("ready");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao gerar áudio"
      );
    }
  }

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

  // Idle state: show generate button
  if (state === "idle") {
    return (
      <div className="my-4">
        <button
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Ouvir artigo
        </button>
      </div>
    );
  }

  // Generating state
  if (state === "generating") {
    return (
      <div className="my-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-full">
          <Loader2 className="w-4 h-4 animate-spin" />
          A gerar áudio...
        </div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="my-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-700 bg-red-50 rounded-full">
          <span>{errorMessage || "Erro"}</span>
          <button
            onClick={handleGenerate}
            className="ml-2 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Ready / Playing state: show player
  return (
    <div className="my-4 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
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

      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </div>
  );
}
