import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/types";
import { toDate } from "@/lib/date";
import { categoryLabel } from "@/lib/utils";

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const DAY_TC = ["日", "一", "二", "三", "四", "五", "六"];

function formatTime(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const am = h < 12;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")}${am ? "am" : "pm"}`;
}

export default function EventListItem({ event }: { event: Event }) {
  const d = toDate(event.eventDate);

  const month = d ? MONTH_ABBR[d.getMonth()] : "";
  const day = d ? d.getDate() : "";
  const weekday = d ? `週${DAY_TC[d.getDay()]}` : "";
  const time = d ? formatTime(d) : "";

  const locText =
    event.eventType === "online"
      ? "Zoom · 線上"
      : event.eventType === "hybrid"
        ? `${event.location ?? "香港"} · 混合`
        : `${event.location ?? "香港"} · 線下`;

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex flex-col sm:flex-row gap-5 p-4 sm:p-5 border-b border-brand-wash last:border-b-0 group hover:bg-brand-bg/40 transition-colors"
    >
      {/* 4:5 portrait promo image */}
      <div className="relative flex-shrink-0 w-full sm:w-[180px] aspect-[4/5] bg-brand-bg overflow-hidden rounded-xl">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, 180px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-light/40 to-brand-accent/20 flex items-center justify-center">
            <span className="font-serif text-3xl text-brand-dark/30">研</span>
          </div>
        )}
        {/* Date badge overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2 text-center shadow-sm">
          <div className="text-[9px] text-brand-accent font-bold tracking-[0.15em]">
            {month}
          </div>
          <div className="text-[18px] text-brand-dark font-serif font-bold leading-none">
            {day}
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="tag-type">{categoryLabel(event.category)}</span>
          <span className="tag-loc">{locText}</span>
          {!event.isFree && event.priceHkd ? (
            <span className="tag-loc">HK${event.priceHkd.toLocaleString()}</span>
          ) : null}
        </div>
        <h3 className="font-serif text-[18px] sm:text-[22px] font-semibold text-brand-text leading-snug mb-2 group-hover:text-brand-accent transition-colors">
          {event.title}
        </h3>
        <div className="text-[12px] text-brand-softer">
          {weekday} {time}
          {event.speakerName && <> — {event.speakerName}</>}
        </div>
      </div>
    </Link>
  );
}
