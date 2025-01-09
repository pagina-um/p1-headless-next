"use client";

import React from "react";
import { Twitter, Facebook, MessageCircle } from "lucide-react";

export default function SocialShare({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description: string;
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
    <div className="flex gap-x-2 items-center">
      <button
        onClick={handleTwitterShare}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-6 h-6 hover:stroke-primary" />
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
  );
}
