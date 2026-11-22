"use client";

import { useEffect, useRef } from "react";
import { EMBED_HEIGHT_MESSAGE } from "./EmbedFrame.client";

/**
 * Wrap the content of an /embed route with this. When the page is inside an
 * iframe it reports the wrapper's height to the parent whenever it changes,
 * so the EmbedFrame in the article can resize. The wrapper, not the
 * document, is measured: the root layout gives body a minimum height of the
 * viewport, which would only ever let the frame grow.
 */
export function EmbedHeightReporter({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.parent === window) return;

    const send = () => {
      window.parent.postMessage(
        { type: EMBED_HEIGHT_MESSAGE, height: el.offsetHeight },
        "*"
      );
    };
    send();
    const observer = new ResizeObserver(send);
    observer.observe(el);
    window.addEventListener("load", send);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", send);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
