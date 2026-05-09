import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Video,
  Users2,
} from "lucide-react";
import { getEventById } from "@/lib/events";
import {
  getSessionRegistrationCounts,
  getUserRegisteredSessionIds,
} from "@/lib/registrations";
import { getSessionUser } from "@/lib/firebase/session";
import { toDate, formatEventDate } from "@/lib/date";
import { categoryLabel, eventTypeLabel } from "@/lib/utils";
import RegistrationForm from "@/components/events/RegistrationForm";
import JsonLd from "@/components/seo/JsonLd";
import { eventJsonLd } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);
  if (!event) return { title: "活動不存在" };
  return {
    title: event.title,
    description: event.description?.slice(0, 160),
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventById(params.id);
  if (!event || !event.isPublished) notFound();

  const [session, sessionCounts] = await Promise.all([
    getSessionUser(),
    getSessionRegistrationCounts(event.id),
  ]);

  const userRegisteredSessionIds = session
    ? await getUserRegisteredSessionIds(session.uid, event.id)
    : new Set<string>();

  // Build session view-models
  const sessionVMs = event.sessions.map((s) => {
    const count = sessionCounts[s.id] ?? 0;
    const isFull = !!(s.capacity && count >= s.capacity);
    const isRegistered = userRegisteredSessionIds.has(s.id);
    const seatsRemaining = s.capacity ? Math.max(s.capacity - count, 0) : null;
    return { ...s, count, isFull, isRegistered, seatsRemaining };
  });

  const allFull = sessionVMs.length > 0 && sessionVMs.every((s) => s.isFull);

  const firstSession = event.sessions[0];
  const firstSessionStart = toDate(firstSession?.startDate);
  const firstSessionEnd = toDate(firstSession?.endDate);

  const schema = eventJsonLd({
    id: event.id,
    title: event.title,
    description: event.description,
    eventDateIso: firstSessionStart?.toISOString() ?? "",
    endDateIso: firstSessionEnd?.toISOString(),
    location: firstSession?.location,
    eventType: event.eventType,
    speakerName: event.speakers[0]?.name,
    isFree: event.isFree,
    priceHkd: event.priceHkd,
    coverImage: event.coverImage,
  });

  const hasMultipleSessions = sessionVMs.length > 1;

  return (
    <>
      <JsonLd data={schema} />
      {/* Title hero (no banner image) */}
      <section className="gradient-hero pt-14 pb-10 lg:pt-20 lg:pb-14">
        <div className="container-wide px-5 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-dark mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回活動列表
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="pill-tag-accent">
              {categoryLabel(event.category)}
            </span>
            <span className="pill-tag">{eventTypeLabel(event.eventType)}</span>
            {!event.isFree && (
              <span className="pill-tag-dark">
                HK${event.priceHkd.toLocaleString()}
              </span>
            )}
          </div>

          <h1 className="font-serif text-[36px] sm:text-[44px] lg:text-[60px] leading-[1.05] text-brand-text max-w-4xl">
            {event.title}
          </h1>
        </div>
      </section>

      <div className="gradient-soft py-10">
        <div className="container-wide px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Left — content */}
          <div className="lg:col-span-2">

            {/* Sessions list */}
            <div className="glass-card rounded-3xl p-7 mb-8">
              <div className="flex items-center gap-2 mb-5">
                <CalendarDays className="w-4 h-4 text-brand-accent" />
                <div className="text-[10px] text-brand-softer tracking-[0.2em] uppercase">
                  {hasMultipleSessions ? `共 ${sessionVMs.length} 場次` : "日期時間"}
                </div>
              </div>

              <div className="space-y-3">
                {sessionVMs.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border ${
                      s.isFull
                        ? "border-brand-hair bg-brand-bg/60 opacity-70"
                        : "border-brand-rule bg-white"
                    }`}
                  >
                    <div className="flex-1">
                      {hasMultipleSessions && (
                        <div className="text-[10px] text-brand-accent font-bold tracking-[0.2em] uppercase mb-1">
                          第 {idx + 1} 場
                        </div>
                      )}
                      <div className="text-[14px] text-brand-text font-semibold mb-0.5">
                        {formatEventDate(s.startDate)}
                        {s.endDate && (
                          <>
                            {" "}
                            —{" "}
                            {`${toDate(s.endDate)?.getHours() ?? 0}:${String(
                              toDate(s.endDate)?.getMinutes() ?? 0
                            ).padStart(2, "0")}`}
                          </>
                        )}
                      </div>
                      {event.eventType !== "online" && s.location && (
                        <div className="text-[12px] text-brand-softer flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {s.location}
                        </div>
                      )}
                      {event.eventType === "online" && (
                        <div className="text-[12px] text-brand-softer flex items-center gap-1.5">
                          <Video className="w-3 h-3" />
                          線上活動（Zoom 連結將於確認信寄出）
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      {s.isRegistered ? (
                        <span className="pill-tag-accent text-[10px]">
                          已報名
                        </span>
                      ) : s.isFull ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] uppercase bg-red-50 text-red-700 border border-red-200">
                          已滿額
                        </span>
                      ) : s.seatsRemaining !== null ? (
                        <span className="text-[11px] text-brand-muted">
                          剩餘 {s.seatsRemaining} / {s.capacity} 個名額
                        </span>
                      ) : (
                        <span className="text-[11px] text-brand-softer">
                          名額不限
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="glass-card rounded-3xl p-7 lg:p-9">
              <div className="pill-tag-accent inline-flex mb-4">活動內容</div>
              <div className="prose prose-sm max-w-none text-[15px] text-brand-text/85 leading-[1.95] whitespace-pre-wrap">
                {event.description || "活動詳情陸續公布。"}
              </div>
            </div>

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <div className="glass-card rounded-3xl p-7 lg:p-9 mt-6">
                <div className="pill-tag inline-flex mb-5">
                  {event.speakers.length > 1 ? "講師團隊" : "講師簡介"}
                </div>
                <div className="space-y-7">
                  {event.speakers.map((sp, idx) => (
                    <div
                      key={`${sp.name}-${idx}`}
                      className="flex flex-col sm:flex-row gap-5 sm:items-start"
                    >
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        {sp.photoUrl ? (
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-brand-accent/20">
                            <Image
                              src={sp.photoUrl}
                              alt={sp.name}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-dark/10 flex items-center justify-center">
                            <Users2 className="w-8 h-8 text-brand-dark/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-serif text-[22px] lg:text-[26px] text-brand-dark mb-2">
                          {sp.name}
                        </h3>
                        {sp.bio && (
                          <p className="text-[14px] text-brand-muted leading-[1.85] whitespace-pre-wrap">
                            {sp.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — promo image + registration */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Promo image (4:5 portrait) */}
              {event.coverImage && (
                <div className="relative w-full aspect-[4/5] bg-brand-bg overflow-hidden rounded-2xl border border-brand-hair shadow-sm">
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 380px"
                    className="object-cover"
                  />
                </div>
              )}

              <RegistrationForm
                eventId={event.id}
                eventTitle={event.title}
                isFree={event.isFree}
                priceHkd={event.priceHkd}
                sessions={sessionVMs.map((s) => ({
                  id: s.id,
                  startDate:
                    typeof s.startDate === "string"
                      ? s.startDate
                      : toDate(s.startDate)?.toISOString() ?? "",
                  location: s.location ?? null,
                  isFull: s.isFull,
                  isRegistered: s.isRegistered,
                  seatsRemaining: s.seatsRemaining,
                  capacity: s.capacity ?? null,
                }))}
                allFull={allFull}
              />

              <div className="mt-6 glass-card rounded-2xl p-5">
                <div className="pill-tag inline-flex mb-3 text-[10px]">
                  有問題？
                </div>
                <p className="text-[12px] text-brand-softer leading-relaxed mb-3">
                  如需取消報名或有其他查詢，請聯絡我哋。
                </p>
                <a
                  href="mailto:info@createhub.biz"
                  className="text-[12px] font-bold text-brand-accent border-b border-brand-accent hover:text-brand-dark hover:border-brand-dark"
                >
                  info@createhub.biz
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
