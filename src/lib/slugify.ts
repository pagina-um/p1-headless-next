/**
 * Convert a string to a URL-friendly slug
 * Handles Portuguese diacritics (á→a, ç→c, etc.)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
}

/**
 * Build a post URI from date and slug
 */
export function buildPostUri(date: Date, slug: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `/${year}/${month}/${day}/${slug}`
}
