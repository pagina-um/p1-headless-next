import type { Density, TitleFont, TitleScale } from "@/types";

/**
 * Class maps for the optional per-story style tokens. Full literal class
 * names (never string-built) so Tailwind's scanner keeps them all.
 * Applied after the base classes via twMerge, so a token always wins over
 * the historical default and absence of a token changes nothing.
 */

export const TITLE_SCALE_CLASSES: Record<TitleScale, string> = {
  s: "text-lg",
  m: "text-2xl",
  l: "text-3xl",
  xl: "text-4xl xl:text-5xl",
};

export const TITLE_FONT_CLASSES: Record<TitleFont, string> = {
  playfair: "font-serif",
  instrument: "font-instrument",
};

/** Vertical rhythm of the classic card's flex column. */
export const DENSITY_GAP_CLASSES: Record<Density, string> = {
  compact: "lg:gap-y-0.5",
  normal: "lg:gap-y-1",
  airy: "lg:gap-y-3",
};

/** Space under the headline. */
export const DENSITY_TITLE_MARGIN_CLASSES: Record<Density, string> = {
  compact: "mb-1",
  normal: "mb-3",
  airy: "mb-4",
};
