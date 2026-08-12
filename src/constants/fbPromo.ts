/** Limits shared by the Facebook promotion UI and its API routes. */

/**
 * What the editor may type. Facebook's own ceiling is ~63 000 characters, but
 * the feed folds anything past the first few lines behind «Ver mais» — a promo
 * that needs unfolding has already lost the reader, so keep it post-sized.
 */
export const FB_MAIN_MAX_CHARS = 500;
