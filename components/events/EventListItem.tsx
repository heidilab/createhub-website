import Link from "next/link";
import type { Event } from "@/types";
import { toDate } from "@/lib/date";
import { categoryLabel, eventTypeLabel } from "@/lib/utils";

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
      className="flex gap-4 items-start py-4 border-b border-brand-wash last:border-b-0 group"
    >
      <div className="date-block">
        <div className="date-block-month">{month}</div>
        <div className="date-block-day">{day}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-brand-text leading-snug mb-1.5 group-hover:text-brand-accent transition-colors">
          {event.title}
        </div>
        <div className="text-[11px] text-brand-softer mb-2">
          {weekday} {time}
          {event.speakerName && <> — {event.speakerName}</>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="tag-type">{categoryLabel(event.category)}</span>
          <span className="tag-loc">{locText}</span>
          {!event.isFree && event.priceHkd ? (
            <span className="tag-loc">HK${event.priceHkd.toLocaleString()}</span>
          ) : null}
          {event.eventType === "online" && (
            <span className="tag-loc sr-only">
              {eventTypeLabel(event.eventType)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
