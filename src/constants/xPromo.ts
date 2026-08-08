/** Limits shared by the X promotion UI and its API routes. */

/** X's own ceiling for a post on a standard account. */
export const X_HARD_LIMIT = 280;

/**
 * What the editor may actually type. Well under X's 280 on purpose: short posts
 * read better in the timeline and leave room for a quote-tweet.
 */
export const MAIN_MAX_CHARS = 240;

/**
 * The reply that carries the link. X counts any URL as 23 characters
 * regardless of its real length, so the text budget is 280 − 23 − 1 space.
 */
export const REPLY_MAX_CHARS = 180;

/** Every link counts as this many characters on X, whatever its length. */
export const X_URL_LENGTH = 23;

/** Default reply text; the article URL is appended when publishing. */
export const DEFAULT_REPLY_TEXT = "A peça completa no PÁGINA UM:";

export const SITE_ORIGIN = "https://paginaum.pt";
