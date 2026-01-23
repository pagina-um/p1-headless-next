"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { FEATURES } from "@/config/features";

type PlayerState = "loading" | "idle" | "generating" | "ready" | "playing" | "error" | "hidden";

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
  const [state, setState] = useState<PlayerState>("loading");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check cache and eligibility on mount
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
          if (!data.eligible) {
            setState("hidden");
            return;
          }
        }
      } catch {
        // Network error — hide to be safe
        setState("hidden");
        return;
      }
      setState((s) => (s === "loading" ? "idle" : s));
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

      // If already cached, use immediately
      if (data.cached) {
        setAudioUrl(data.url);
        setDuration(data.durationSeconds);
        setState("ready");
        return;
      }

      // Poll until generation completes
      pollForAudio();
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao gerar áudio"
      );
    }
  }

  function pollForAudio() {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tts?postId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cached) {
            clearInterval(interval);
            pollIntervalRef.current = null;
            setAudioUrl(data.url);
            setDuration(data.durationSeconds);
            setState("ready");
          }
        }
      } catch {
        // Keep polling
      }
    }, 3000);

    pollIntervalRef.current = interval;

    // Stop polling after 90s
    setTimeout(() => {
      if (pollIntervalRef.current === interval) {
        clearInterval(interval);
        pollIntervalRef.current = null;
        setState((s) => {
          if (s === "generating") {
            setErrorMessage("Tempo esgotado ao gerar áudio");
            return "error";
          }
          return s;
        });
      }
    }, 90000);
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

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

  if (!FEATURES.TTS_ENABLED || state === "hidden") return null;

  const isPlayerVisible = state === "ready" || state === "playing";

  return (
    <div className="mt-3 mb-0 md:mt-4 md:mb-0 w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs text-gray-500 mb-2 font-medium">Ouvir artigo (experimental)</p>
      <div className="flex items-center gap-3">
        <button
          onClick={isPlayerVisible ? handlePlayPause : handleGenerate}
          disabled={state === "loading" || state === "generating"}
          className="flex-shrink-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
          aria-label={state === "playing" ? "Pausar" : "Reproduzir"}
        >
          {state === "loading" || state === "generating" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : state === "playing" ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div
            ref={progressBarRef}
            className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
            onClick={isPlayerVisible ? handleProgressBarClick : undefined}
          >
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {state === "generating"
                ? "A gerar áudio..."
                : state === "error"
                  ? errorMessage || "Erro"
                  : formatTime(currentTime)}
            </span>
            <span>{isPlayerVisible ? formatTime(duration) : ""}</span>
          </div>
        </div>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </div>
  );
}
