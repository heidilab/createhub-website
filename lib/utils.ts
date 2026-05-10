import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTC(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}年${m}月${day}日 ${hh}:${mm}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function eventTypeLabel(type: string): string {
  const map: Record<string, string> = {
    online: "線上",
    offline: "線下",
    hybrid: "混合",
  };
  return map[type] ?? type;
}

export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    lecture: "講座",
    workshop: "工作坊",
    networking: "交流會",
  };
  return map[category] ?? category;
}

export function priceLabel(isFree: boolean, priceHkd?: number): string {
  if (isFree || !priceHkd) return "免費";
  return `HK$${priceHkd.toLocaleString("en-HK")}`;
}

/**
 * Returns a vague availability label so we don't expose exact remaining count.
 *  - capacity null  → "尚有位置" (unlimited)
 *  - 0 remaining    → "名額已滿"
 *  - <= 35% left    → "尚餘少量位置"
 *  - otherwise      → "尚有位置"
 */
export function availabilityLabel(
  seatsRemaining: number | null | undefined,
  capacity: number | null | undefined
): { text: string; tone: "open" | "low" | "full" } {
  if (capacity == null || seatsRemaining == null) {
    return { text: "尚有位置", tone: "open" };
  }
  if (seatsRemaining <= 0) {
    return { text: "名額已滿", tone: "full" };
  }
  const ratio = seatsRemaining / capacity;
  if (ratio <= 0.35) {
    return { text: "尚餘少量位置", tone: "low" };
  }
  return { text: "尚有位置", tone: "open" };
}
