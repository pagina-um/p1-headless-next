"use client";

import React from "react";
import { Facebook, MessageCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

export default function SocialShare({
  url,
  title,
  description,
  className,
}: {
  url: string;
  title: string;
  description: string;
  className?: string;
}) {
  const handleTwitterShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  return (
    <div className={twMerge("flex flex-col items-center gap-y-2", className)}>
      <div className="flex gap-x-2 items-center -mx-2">
        <button
          onClick={handleTwitterShare}
          className="p-2 rounded-full hover:text-primary text-3xl transition-colors"
          aria-label="Share on Twitter"
        >
          𝕏
        </button>

        <button
          onClick={handleFacebookShare}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-6 h-6 hover:stroke-primary" />
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Share via system share or copy link"
        >
          <MessageCircle className="w-6 h-6 hover:stroke-primary" />
        </button>
      </div>

      <a
        href="https://www.google.com/preferences/source?q=paginaum.pt"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
        aria-label="Adicionar o Página UM como fonte preferencial no Google"
        title="Adicionar o Página UM como fonte preferencial no Google"
      >
        <img
          src="/google-preferred-source-badge.png"
          srcSet="/google-preferred-source-badge.png 1x, /google-preferred-source-badge@2x.png 2x"
          alt="Adicione como fonte preferencial no Google"
          className="h-14 w-auto"
        />
      </a>
    </div>
  );
}
