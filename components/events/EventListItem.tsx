import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/types";
import { hktParts, formatTime24, toDate } from "@/lib/date";
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

export default function EventListItem({ event }: { event: Event }) {
  const sessions =
    event.sessions && event.sessions.length > 0
      ? event.sessions
      : [
          {
            id: "default",
            startDate: event.eventDate,
            endDate: event.endDate,
            location: event.location ?? null,
          },
        ];

  const firstParts = hktParts(sessions[0]?.startDate);

  const speakerNames =
    event.speakers && event.speakers.length > 0
      ? event.speakers.map((s) => s.name).join(" × ")
      : event.speakerName;

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
        {/* Date badge — first session for single-day; "共 N 場" for multi-session */}
        {sessions.length === 1 && firstParts ? (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2 text-center shadow-sm">
            <div className="text-[9px] text-brand-accent font-bold tracking-[0.15em]">
              {MONTH_ABBR[firstParts.month - 1]}
            </div>
            <div className="text-[18px] text-brand-dark font-serif font-bold leading-none">
              {firstParts.day}
            </div>
          </div>
        ) : sessions.length > 1 ? (
          <div className="absolute top-3 left-3 bg-brand-dark/95 backdrop-blur px-3 py-1.5 text-center shadow-sm">
            <div className="text-[9px] text-brand-accent font-bold tracking-[0.2em] uppercase">
              共 {sessions.length} 場
            </div>
          </div>
        ) : null}
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
        <h3 className="font-serif text-[18px] sm:text-[22px] font-semibold text-brand-text leading-snug mb-3 group-hover:text-brand-accent transition-colors">
          {event.title}
        </h3>

        {/* Sessions list — full date for each */}
        <div className="space-y-1 text-[12px] sm:text-[13px] text-brand-muted">
          {sessions.map((s, idx) => {
            const p = hktParts(s.startDate);
            if (!p) return null;
            const endDate = toDate(s.endDate);
            const endTime =
              endDate && sessions.length === 1 ? formatTime24(s.endDate) : null;
            return (
              <div key={s.id ?? idx} className="flex items-baseline gap-2">
                {sessions.length > 1 && (
                  <span className="text-[10px] text-brand-accent font-bold tracking-[0.15em] uppercase flex-shrink-0">
                    第{idx + 1}場
                  </span>
                )}
                <span>
                  {p.year}年{p.month}月{p.day}日（週{p.weekdayTC}）
                  {String(p.hour).padStart(2, "0")}:
                  {String(p.minute).padStart(2, "0")}
                  {endTime && ` — ${endTime}`}
                </span>
              </div>
            );
          })}
        </div>

        {speakerNames && (
          <div className="text-[12px] text-brand-softer mt-2.5">
            <span className="text-brand-muted/70">講師</span>　{speakerNames}
          </div>
        )}
      </div>
    </Link>
  );
}
