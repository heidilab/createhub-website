// Converts a Firestore Timestamp (or similar date value) to a plain ISO string.
// Needed because Firestore Timestamps are class instances and cannot cross the
// Server-Component -> Client-Component boundary in Next.js App Router.
export function serializeDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const v = value as { toDate?: () => Date; seconds?: number };
    if (typeof v.toDate === "function") return v.toDate().toISOString();
    if (typeof v.seconds === "number")
      return new Date(v.seconds * 1000).toISOString();
  }
  return null;
}
