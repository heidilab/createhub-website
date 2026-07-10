/**
 * Renders admin-authored description content as HTML.
 *
 * TipTap saves content as HTML. Older events (before rich-text was added)
 * are plain text with newline breaks — those get escaped and wrapped in a
 * <p> with <br/>s so they render correctly under the same styles.
 *
 * Content comes from admins only (auth-gated), so we don't sanitize —
 * TipTap's schema already restricts to a safe subset.
 */
export function descriptionToHtml(raw: string | null | undefined): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  // If it already contains HTML tags, treat as HTML.
  if (/<[a-z][^>]*>/i.test(s)) return s;
  // Plain text — escape then convert newlines to <br>.
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<p>${escaped.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
}

/** Strip HTML to plain text for previews (list cards, meta descriptions). */
export function stripHtml(raw: string | null | undefined): string {
  return (raw ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
