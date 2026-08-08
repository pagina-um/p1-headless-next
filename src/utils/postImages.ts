/**
 * Images an editor can attach to an X post: the featured image first, then
 * every picture embedded in the article body, in reading order.
 */
export interface PostImage {
  url: string;
  alt: string;
  /** True for the WordPress featured image — the default selection. */
  featured: boolean;
}

const IMG_TAG = /<img\b[^>]*>/gi;
const ATTR = (name: string) =>
  new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i");

/**
 * WordPress emits several sized copies of the same upload; the srcset entries
 * are all `name-800x600.jpg` variants of `name.jpg`. Collapsing them to the
 * base name stops the same photo appearing three times in the picker.
 */
function dedupeKey(url: string): string {
  return url.replace(/-\d+x\d+(?=\.[a-z]{3,4}(?:$|\?))/i, "").split("?")[0];
}

/** Largest candidate in a srcset, so uploads to X are not thumbnails. */
function widestFromSrcSet(srcset: string): string | null {
  let best: { url: string; width: number } | null = null;
  for (const candidate of srcset.split(",")) {
    const [url, descriptor] = candidate.trim().split(/\s+/);
    if (!url) continue;
    const width = descriptor?.endsWith("w") ? parseInt(descriptor, 10) : 0;
    if (!best || width > best.width) best = { url, width: width || 0 };
  }
  return best?.url ?? null;
}

export function extractPostImages(
  content: string | null | undefined,
  featured?: { sourceUrl?: string | null; altText?: string | null } | null
): PostImage[] {
  const images: PostImage[] = [];
  const seen = new Set<string>();

  const push = (url: string, alt: string, isFeatured: boolean) => {
    if (!/^https?:\/\//i.test(url)) return;
    if (/\.svg(?:$|\?)/i.test(url)) return; // X rejects SVG
    const key = dedupeKey(url);
    if (seen.has(key)) return;
    seen.add(key);
    images.push({ url, alt, featured: isFeatured });
  };

  if (featured?.sourceUrl) {
    push(featured.sourceUrl, featured.altText ?? "", true);
  }

  for (const tag of content?.match(IMG_TAG) ?? []) {
    const srcset = tag.match(ATTR("srcset"))?.[1];
    const src =
      (srcset && widestFromSrcSet(srcset)) ?? tag.match(ATTR("src"))?.[1];
    if (src) push(src, tag.match(ATTR("alt"))?.[1] ?? "", false);
  }

  return images;
}
