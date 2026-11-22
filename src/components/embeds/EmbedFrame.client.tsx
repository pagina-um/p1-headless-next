"use client";

import { useEffect, useRef, useState } from "react";

export const EMBED_HEIGHT_MESSAGE = "p1-embed-height";
const MIN_HEIGHT = 50;
const MAX_HEIGHT = 20000;

interface EmbedFrameProps {
  src: string;
  title: string;
  /** Height until the embedded page reports its own. */
  initialHeight: number;
}

/**
 * Iframe for a page of this site embedded inside an article (an
 * infografia's /embed route). The embedded page reports its content height
 * with postMessage (see EmbedHeightReporter) and the frame follows it, so
 * the article never shows an inner scrollbar.
 */
export function EmbedFrame({ src, title, initialHeight }: EmbedFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initialHeight);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!ref.current || event.source !== ref.current.contentWindow) return;
      const data = event.data;
      if (!data || data.type !== EMBED_HEIGHT_MESSAGE) return;
      const next = Number(data.height);
      if (Number.isFinite(next) && next >= MIN_HEIGHT && next <= MAX_HEIGHT) {
        setHeight(Math.ceil(next));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      loading="lazy"
      className="my-6 block w-full max-w-full border-0"
      style={{ height }}
    />
  );
}
