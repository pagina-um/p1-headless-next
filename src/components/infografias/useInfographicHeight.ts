import { useEffect, type RefObject } from "react";
import {
  INFOGRAPHIC_HEIGHT_TYPE,
  MAX_INFOGRAPHIC_HEIGHT,
  isInfographicHeightRequest,
} from "./embed";

/** Import from the infographic's client component; observe its content root. */
export function useInfographicHeight(
  ref: RefObject<HTMLElement>,
  enabled: boolean
): void {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || window.parent === window) return;

    let pendingFrame: number | null = null;
    let lastHeight = 0;
    let forceNextMessage = false;
    let disposed = false;
    const parent = window.parent;
    const origin = window.location.origin;

    const scheduleMeasurement = (force = false) => {
      if (disposed) return;
      forceNextMessage = forceNextMessage || force;
      if (pendingFrame !== null) return;

      pendingFrame = window.requestAnimationFrame(() => {
        pendingFrame = null;
        if (disposed) return;
        // Measuring content, rather than the document viewport, permits shrink.
        const height = Math.min(
          MAX_INFOGRAPHIC_HEIGHT,
          Math.max(1, Math.ceil(element.getBoundingClientRect().height))
        );
        if (forceNextMessage || height !== lastHeight) {
          parent.postMessage({ type: INFOGRAPHIC_HEIGHT_TYPE, height }, origin);
          lastHeight = height;
        }
        forceNextMessage = false;
      });
    };

    const receiveRequest = (event: MessageEvent) => {
      if (
        event.source === parent &&
        event.origin === origin &&
        isInfographicHeightRequest(event.data)
      ) {
        // A fresh handshake must reply even when the height has not changed.
        scheduleMeasurement(true);
      }
    };
    const onResize = () => scheduleMeasurement();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => scheduleMeasurement());

    observer?.observe(element);
    window.addEventListener("message", receiveRequest);
    window.addEventListener("resize", onResize);
    scheduleMeasurement(true);

    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("message", receiveRequest);
      window.removeEventListener("resize", onResize);
      if (pendingFrame !== null) window.cancelAnimationFrame(pendingFrame);
    };
  }, [ref, enabled]);
}
