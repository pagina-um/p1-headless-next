"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_INFOGRAPHIC_HEIGHT,
  INFOGRAPHIC_HEIGHT_REQUEST_TYPE,
  normaliseInfographicSrc,
  readInfographicHeight,
} from "./embed";

interface InfographicFrameProps {
  src: string;
  title?: string;
}

/** The article needs only an iframe tag in WordPress, with no editor script. */
export function InfographicFrame({ src, title }: InfographicFrameProps) {
  const nativeSrc = normaliseInfographicSrc(src);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(DEFAULT_INFOGRAPHIC_HEIGHT);

  const requestHeight = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: INFOGRAPHIC_HEIGHT_REQUEST_TYPE },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    setHeight(DEFAULT_INFOGRAPHIC_HEIGHT);
    if (!nativeSrc) return;

    const receiveHeight = (event: MessageEvent) => {
      const nextHeight = readInfographicHeight(
        event,
        iframeRef.current?.contentWindow ?? null,
        window.location.origin
      );
      if (nextHeight !== null) setHeight(nextHeight);
    };

    window.addEventListener("message", receiveHeight);
    // Also request after installing the listener, in case load already fired.
    requestHeight();
    return () => window.removeEventListener("message", receiveHeight);
  }, [nativeSrc, requestHeight]);

  if (!nativeSrc) return null;

  return createElement("iframe", {
    ref: iframeRef,
    src: nativeSrc,
    title: title?.trim() || "Infografia interactiva do PÁGINA UM",
    width: "100%",
    height,
    className: "block w-full max-w-full border-0",
    loading: "lazy",
    onLoad: requestHeight,
  });
}
