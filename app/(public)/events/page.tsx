import { Suspense } from "react";
import { Calendar, Sparkles } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import EventFilter from "@/components/events/EventFilter";
import { getPublishedEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "活動",
  description:
    "創研社定期舉辦線上及線下商業講座、工作坊與交流活動，助您掌握最新商業資訊，拓展人脈。",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: { status?: string; type?: string; category?: string };
}) {
  const status = (searchParams?.status as "past" | "upcoming") || "upcoming";
  const events = await getPublishedEvents({
    status,
    eventType: searchParams?.type,
    category: searchParams?.category,
  });

  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[18vw] lg:text-[16rem] leading-none whitespace-nowrap"
          >
            EVENTS
          </h2>
        </div>
        <div className="relative container-wide px-5 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="pill-tag mb-6">
              <Calendar className="w-3 h-3 mr-1.5 text-brand-accent" />
              Events & Workshops
            </div>
            <h1 className="font-serif text-[48px] sm:text-[64px] lg:text-[80px] leading-[1.0] text-brand-text mb-6">
              活動
            </h1>
            <p className="text-[15px] lg:text-[17px] text-brand-muted leading-[1.85] max-w-2xl">
              創研社定期舉辦線上及線下商業講座、工作坊與交流活動，助你掌握最新商業資訊，與業界精英建立人脈。
            </p>
          </div>

          {/* Floating tag pills */}
          <div className="flex flex-wrap gap-2.5 mt-10 max-w-xl">
            <span className="pill-tag" style={{ transform: "rotate(-2deg)" }}>
              講座
            </span>
            <span
              className="pill-tag-accent"
              style={{ transform: "rotate(1deg)" }}
            >
              工作坊
            </span>
            <span className="pill-tag" style={{ transform: "rotate(-1deg)" }}>
              交流會
            </span>
            <span
              className="pill-tag-dark"
              style={{ transform: "rotate(2deg)" }}
            >
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              Networking
            </span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <Suspense>
        <div className="bg-white border-b border-brand-hair">
          <EventFilter />
        </div>
      </Suspense>

      {/* Event grid */}
      <section className="gradient-soft py-14 lg:py-20">
        <div className="container-wide px-5 lg:px-8">
          {events.length > 0 ? (
            <>
              <div className="mb-8 flex items-center gap-3">
                <span className="pill-tag-dark">
                  {events.length} {status === "past" ? "Past" : "Upcoming"}
                </span>
                <span className="text-[12px] text-brand-softer">
                  顯示 {events.length} 個{status === "past" ? "過往" : "即將舉行"}活動
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center">
              <div className="pill-tag inline-flex mb-5">No Events Yet</div>
              <h2 className="font-serif text-[26px] lg:text-[32px] text-brand-text mb-3">
                {status === "past" ? "暫未有過往活動記錄" : "活動籌備中"}
              </h2>
              <p className="text-[14px] text-brand-softer max-w-md mx-auto">
                {status === "past"
                  ? "最新活動會陸續公布，敬請留意。"
                  : "密切留意即將公布嘅新活動，或訂閱 Newsletter 第一時間收到通知。"}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
