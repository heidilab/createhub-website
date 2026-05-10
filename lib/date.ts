import type { FirestoreDate } from "@/types";

const HKT_OFFSET_MS = 8 * 60 * 60 * 1000;
const WEEKDAY_TC = ["日", "一", "二", "三", "四", "五", "六"] as const;

export function toDate(value: FirestoreDate | undefined | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && "seconds" in value) {
    return new Date(value.seconds * 1000);
  }
  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

/**
 * Decompose a UTC instant into HKT (UTC+8) date parts. All formatting
 * helpers go through this so dates render the same on Vercel (UTC) as
 * they do in a Hong Kong browser.
 */
export function hktParts(value: FirestoreDate | undefined | null): {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0=Sun
  weekdayTC: string; // 日, 一, 二, ...
  hour: number;
  minute: number;
} | null {
  const d = toDate(value);
  if (!d) return null;
  const hkt = new Date(d.getTime() + HKT_OFFSET_MS);
  const weekday = hkt.getUTCDay();
  return {
    year: hkt.getUTCFullYear(),
    month: hkt.getUTCMonth() + 1,
    day: hkt.getUTCDate(),
    weekday,
    weekdayTC: WEEKDAY_TC[weekday],
    hour: hkt.getUTCHours(),
    minute: hkt.getUTCMinutes(),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Returns "2026年06月05日 14:00" in HKT.
 */
export function formatEventDate(
  value: FirestoreDate | undefined | null
): string {
  const p = hktParts(value);
  if (!p) return "";
  return `${p.year}年${pad2(p.month)}月${pad2(p.day)}日 ${pad2(p.hour)}:${pad2(p.minute)}`;
}

/**
 * Returns "2026年06月05日" in HKT (no time).
 */
export function formatDateOnly(
  value: FirestoreDate | undefined | null
): string {
  const p = hktParts(value);
  if (!p) return "";
  return `${p.year}年${pad2(p.month)}月${pad2(p.day)}日`;
}

/**
 * Returns "06/05 (五)" — short form for compact lists.
 */
export function formatDateShort(
  value: FirestoreDate | undefined | null
): string {
  const p = hktParts(value);
  if (!p) return "";
  return `${pad2(p.month)}/${pad2(p.day)} (${p.weekdayTC})`;
}

/**
 * Returns "14:00" in HKT.
 */
export function formatTime24(
  value: FirestoreDate | undefined | null
): string {
  const p = hktParts(value);
  if (!p) return "";
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

/**
 * Returns "2026年6月5日 (週五) 14:00" — long form with weekday.
 */
export function formatEventDateLong(
  value: FirestoreDate | undefined | null
): string {
  const p = hktParts(value);
  if (!p) return "";
  return `${p.year}年${p.month}月${p.day}日 (週${p.weekdayTC}) ${pad2(p.hour)}:${pad2(p.minute)}`;
}

export function isPast(value: FirestoreDate | undefined | null): boolean {
  const d = toDate(value);
  if (!d) return false;
  return d.getTime() < Date.now();
}
