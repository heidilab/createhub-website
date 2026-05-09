import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Video } from "lucide-react";
import type { Event } from "@/types";
import { toDate } from "@/lib/date";
import { categoryLabel, priceLabel } from "@/lib/utils";

const MONTH_ABBR = [
  "JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC",
];

function formatTime(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const am = h < 12;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")}${am ? "am" : "pm"}`;
}

export default function EventCard({ event }: { event: Event }) {
  const d = toDate(event.eventDate);
  const month = d ? MONTH_ABBR[d.getMonth()] : "";
  const day = d ? d.getDate() : "";
  const time = d ? formatTime(d) : "";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col bg-white border border-brand-hair hover:border-brand-accent transition"
    >
      <div className="aspect-[16/10] relative bg-gradient-to-br from-brand-light/40 to-brand-accent/20 overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-5xl text-brand-dark/20">創 研 社</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="tag-type bg-white/95">{categoryLabel(event.category)}</span>
          <span className="tag-loc bg-white/95 border-white">
            {event.eventType === "online" ? (
              <span className="inline-flex items-center gap-1">
                <Video className="w-2.5 h-2.5" /> 線上
              </span>
            ) : event.eventType === "hybrid" ? (
              "混合"
            ) : (
              "線下"
            )}
          </span>
        </div>
        {d && (
          <div className="absolute bottom-3 left-3 bg-white border border-brand-accent px-2.5 py-1.5 text-center">
            <div className="text-[9px] text-brand-accent tracking-[0.15em] uppercase font-bold leading-none">
              {month}
            </div>
            <div className="font-serif text-[20px] text-brand-dark font-bold leading-none mt-0.5">
              {day}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="font-serif text-[18px] text-brand-text leading-snug mb-3 line-clamp-2 group-hover:text-brand-accent transition-colors">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-[12px] text-brand-softer">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3 flex-shrink-0" />
            <span>{d ? `${month} ${day} · ${time}` : ""}</span>
          </div>
          {event.speakers && event.speakers.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-brand-muted">
                {event.speakers.length > 1 ? "講師" : "講師"}
              </span>
              <span className="truncate">
                {event.speakers.map((s) => s.name).join(" × ")}
              </span>
            </div>
          )}
          {(event.location || event.eventType === "online") && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {event.eventType === "online" ? "Zoom · 線上" : event.location}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-brand-hair mt-4">
          <span className="text-[13px] font-bold text-brand-dark">
            {priceLabel(event.isFree, event.priceHkd)}
          </span>
          <span className="text-[11px] font-bold text-brand-accent tracking-[0.15em] uppercase">
            查看詳情 →
          </span>
        </div>
      </div>
    </Link>
  );
}
