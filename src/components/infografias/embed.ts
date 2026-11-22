/** Same-origin embeds share this protocol, independently of their subject. */
export const INFOGRAPHIC_HEIGHT_TYPE = "p1:infographic:height";
export const INFOGRAPHIC_HEIGHT_REQUEST_TYPE = "p1:infographic:request-height";
export const DEFAULT_INFOGRAPHIC_HEIGHT = 1000;
export const MAX_INFOGRAPHIC_HEIGHT = 20000;

const CANONICAL_ORIGIN = "https://paginaum.pt";
const CANONICAL_ORIGINS = new Set([
  CANONICAL_ORIGIN,
  "https://www.paginaum.pt",
]);
const EMBED_PATH = /^\/infografias\/[a-z0-9]+(?:-[a-z0-9]+)*\/embed\/?$/;

/**
 * Only native infographic routes are special-cased by the article parser.
 * Return a relative path so previews use their own deployment, not production.
 */
export function normaliseInfographicSrc(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const src = value.trim();
  if (
    !src ||
    src.includes("\\") ||
    Array.from(src).some((char) => {
      const code = char.charCodeAt(0);
      return code <= 0x20 || code === 0x7f;
    })
  ) {
    return null;
  }

  let rawPath: string;
  let url: URL;
  try {
    if (src.startsWith("/") && !src.startsWith("//")) {
      rawPath = src.split(/[?#]/, 1)[0];
      url = new URL(src, CANONICAL_ORIGIN);
    } else {
      const absolute = src.match(/^https:\/\/[^/?#]+(\/[^?#]*)?(?:[?#]|$)/i);
      if (!absolute) return null;
      rawPath = absolute[1] || "/";
      url = new URL(src);
    }
  } catch {
    return null;
  }

  if (
    !CANONICAL_ORIGINS.has(url.origin) ||
    url.username ||
    url.password ||
    !EMBED_PATH.test(rawPath)
  ) {
    return null;
  }

  return rawPath.replace(/\/$/, "") + url.search + url.hash;
}

type EmbedMessageEvent = Pick<MessageEvent, "data" | "source" | "origin">;

/** Accept only a bounded numeric height from this exact iframe and origin. */
export function readInfographicHeight(
  event: EmbedMessageEvent,
  expectedSource: MessageEventSource | null,
  expectedOrigin: string
): number | null {
  if (
    !expectedSource ||
    event.source !== expectedSource ||
    event.origin !== expectedOrigin ||
    !event.data ||
    typeof event.data !== "object" ||
    Array.isArray(event.data) ||
    event.data.type !== INFOGRAPHIC_HEIGHT_TYPE
  ) {
    return null;
  }

  const height: unknown = event.data.height;
  if (
    typeof height !== "number" ||
    !Number.isFinite(height) ||
    height <= 0 ||
    height > MAX_INFOGRAPHIC_HEIGHT
  ) {
    return null;
  }
  return Math.ceil(height);
}

export function isInfographicHeightRequest(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "type" in value &&
    value.type === INFOGRAPHIC_HEIGHT_REQUEST_TYPE
  );
}
