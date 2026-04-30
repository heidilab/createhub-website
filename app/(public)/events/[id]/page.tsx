import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Video,
  Users2,
  Ticket,
} from "lucide-react";
import { getEventById } from "@/lib/events";
import { hasUserRegistered } from "@/lib/registrations";
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

  const session = await getSessionUser();
  const alreadyRegistered = session
    ? await hasUserRegistered(session.uid, event.id)
    : false;

  const startDate = toDate(event.eventDate);
  const endDate = toDate(event.endDate);

  const schema = eventJsonLd({
    id: event.id,
    title: event.title,
    description: event.description,
    eventDateIso: startDate?.toISOString() ?? "",
    endDateIso: endDate?.toISOString(),
    location: event.location,
    eventType: event.eventType,
    speakerName: event.speakerName,
    isFree: event.isFree,
    priceHkd: event.priceHkd,
    coverImage: event.coverImage,
  });

  return (
    <>
      <JsonLd data={schema} />
      {/* Cover */}
      {event.coverImage ? (
        <div className="relative w-full aspect-[21/9] bg-brand-dark">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="w-full aspect-[21/9] bg-gradient-to-br from-brand-dark to-brand-text flex items-center justify-center">
          <span className="font-serif text-6xl lg:text-8xl text-white/10">
            創 研 社
          </span>
        </div>
      )}

      {/* Back link */}
      <div className="container-wide px-5 lg:px-8 pt-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-dark"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回活動列表
        </Link>
      </div>

      <div className="gradient-soft py-10">
        <div className="container-wide px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
        {/* Left — content */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="pill-tag-accent">{categoryLabel(event.category)}</span>
            <span className="pill-tag">{eventTypeLabel(event.eventType)}</span>
            {!event.isFree && (
              <span className="pill-tag-dark">HK${event.priceHkd.toLocaleString()}</span>
            )}
          </div>

          <h1 className="font-serif text-[36px] sm:text-[42px] lg:text-[54px] leading-[1.1] text-brand-text mb-8">
            {event.title}
          </h1>

          <div className="glass-card rounded-3xl p-7 space-y-4 mb-8">
            <InfoRow
              icon={<CalendarDays className="w-4 h-4" />}
              label="日期時間"
              value={
                startDate
                  ? endDate
                    ? `${formatEventDate(event.eventDate)} — ${endDate.getHours()}:${String(endDate.getMinutes()).padStart(2, "0")}`
                    : formatEventDate(event.eventDate)
                  : "—"
              }
            />
            {event.eventType === "online" ? (
              <InfoRow
                icon={<Video className="w-4 h-4" />}
                label="地點"
                value="線上活動（Zoom 連結將於報名確認信寄出）"
              />
            ) : (
              event.location && (
                <InfoRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="地點"
                  value={event.location}
                />
              )
            )}
            {event.speakerName && (
              <InfoRow
                icon={<Users2 className="w-4 h-4" />}
                label="講師"
                value={event.speakerName}
              />
            )}
            {event.capacity && (
              <InfoRow
                icon={<Ticket className="w-4 h-4" />}
                label="名額"
                value={`${event.capacity} 位`}
              />
            )}
          </div>

          {/* Description */}
          <div className="glass-card rounded-3xl p-7 lg:p-9">
            <div className="pill-tag-accent inline-flex mb-4">活動內容</div>
            <div className="prose prose-sm max-w-none text-[15px] text-brand-text/85 leading-[1.95] whitespace-pre-wrap">
              {event.description || "活動詳情陸續公布。"}
            </div>
          </div>

          {/* Speaker */}
          {event.speakerBio && (
            <div className="glass-card rounded-3xl p-7 lg:p-9 mt-6">
              <div className="pill-tag inline-flex mb-4">講師簡介</div>
              <h3 className="font-serif text-[24px] lg:text-[28px] text-brand-dark mb-4">
                {event.speakerName}
              </h3>
              <p className="text-[14px] text-brand-muted leading-[1.95] whitespace-pre-wrap">
                {event.speakerBio}
              </p>
            </div>
          )}
        </div>

        {/* Right — registration */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28">
            <RegistrationForm
              eventId={event.id}
              eventTitle={event.title}
              isFree={event.isFree}
              priceHkd={event.priceHkd}
              alreadyRegistered={alreadyRegistered}
            />

            <div className="mt-6 glass-card rounded-2xl p-5">
              <div className="pill-tag inline-flex mb-3 text-[10px]">有問題？</div>
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-brand-accent mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] text-brand-softer tracking-[0.2em] uppercase mb-0.5">
          {label}
        </div>
        <div className="text-[14px] text-brand-text">{value}</div>
      </div>
    </div>
  );
}
