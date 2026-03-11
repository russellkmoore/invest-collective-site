/**
 * Shared slug generation utility.
 * Single source of truth — replaces duplicate implementations in
 * thesis-scoring.ts and admin/research/upload/actions.ts.
 */

/**
 * Generate a URL-friendly slug from a title string.
 * Lowercases, replaces non-alphanumeric sequences with hyphens,
 * trims leading/trailing hyphens, and truncates to 100 characters.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}
