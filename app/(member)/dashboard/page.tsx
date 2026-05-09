import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Video, User, Mail, Phone } from "lucide-react";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { getUserRegistrations } from "@/lib/registrations";
import { toDate, formatEventDate } from "@/lib/date";
import { categoryLabel, eventTypeLabel, priceLabel } from "@/lib/utils";
import type { UserProfile } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "會員中心" };

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login?redirect=/dashboard");

  const profileSnap = await adminDb()
    .collection("users")
    .doc(sessionUser.uid)
    .get();
  const profile = profileSnap.exists
    ? ({ ...(profileSnap.data() as UserProfile), uid: sessionUser.uid })
    : null;

  const registrations = await getUserRegistrations(sessionUser.uid);
  const now = Date.now();
  // Use the user's specific registered-session date, not the event's first-session date,
  // so a user registered for session 2 of a multi-session event still shows in upcoming
  // even after session 1 has passed.
  const sessionTime = (r: (typeof registrations)[number]): number =>
    toDate(r.registeredSession?.startDate ?? r.event?.eventDate)?.getTime() ?? 0;

  const upcoming = registrations.filter(
    (r) => r.event && r.status === "confirmed" && sessionTime(r) >= now
  );
  const past = registrations.filter(
    (r) =>
      r.event && (r.status === "cancelled" || sessionTime(r) < now)
  );

  return (
    <>
      {/* Hero strip */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[16vw] lg:text-[14rem] leading-none whitespace-nowrap"
          >
            DASHBOARD
          </h2>
        </div>
        <div className="relative container-wide px-5 lg:px-8 py-14 lg:py-20">
          <div className="pill-tag mb-5">Member Dashboard</div>
          <h1 className="font-serif text-[36px] sm:text-[44px] lg:text-[56px] text-brand-text leading-tight">
            歡迎回嚟，
            <br />
            <span className="text-brand-dark font-semibold italic">
              {profile?.fullName || sessionUser.email}
            </span>
          </h1>
          <p className="text-[14px] text-brand-softer mt-4">
            管理你嘅個人資料同活動報名
          </p>
        </div>
      </section>

      <div className="container-wide px-5 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="eyebrow-muted mb-4">個人資料</div>
            <ProfileRow icon={<User className="w-3.5 h-3.5" />} label="姓名" value={profile?.fullName || "—"} />
            <ProfileRow icon={<Mail className="w-3.5 h-3.5" />} label="電郵" value={profile?.email || sessionUser.email} />
            <ProfileRow icon={<Phone className="w-3.5 h-3.5" />} label="WhatsApp" value={profile?.whatsapp || "—"} />
            <div className="pt-3 mt-3 border-t border-brand-hair">
              <span className="text-[10px] text-brand-softer tracking-[0.2em] uppercase">
                {profile?.role === "admin" ? "管理員" : "會員"}
              </span>
            </div>
          </div>

          <div className="glass-card-dark rounded-2xl p-6">
            <div
              className="pill-tag-accent inline-flex mb-4"
              style={{ background: "rgba(52, 204, 239, 0.18)", color: "#a8eaf7" }}
            >
              Online Learning
            </div>
            <h3 className="font-serif text-[20px] text-white leading-tight mb-2">
              線上學習平台
            </h3>
            <p className="text-[13px] text-white/75 leading-relaxed mb-5">
              前往 CREATE HUB 學習平台，隨時掌握最新商業課程。
            </p>
            <a
              href={process.env.NEXT_PUBLIC_LEARNWORLDS_URL || "https://createhub.learnworlds.com/home"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] font-bold text-brand-accent border-b border-brand-accent pb-[1px] hover:text-white hover:border-white"
            >
              前往學習平台 →
            </a>
          </div>
        </div>

        {/* Right — Registrations */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-end justify-between mb-5 pb-3 border-b border-brand-hair">
              <div>
                <div className="eyebrow-muted mb-2">已報名活動</div>
                <h2 className="font-serif text-[24px] text-brand-text">
                  即將舉行 ({upcoming.length})
                </h2>
              </div>
              <Link href="/events" className="btn-secondary-link">
                探索更多活動
              </Link>
            </div>

            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((r) =>
                  r.event ? (
                    <RegistrationCard
                      key={r.id}
                      event={r.event}
                      sessionDate={r.registeredSession?.startDate}
                      sessionLocation={r.registeredSession?.location}
                      hasMultipleSessions={(r.event.sessions?.length ?? 0) > 1}
                    />
                  ) : null
                )}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center">
                <CalendarDays className="w-10 h-10 text-brand-accent mx-auto mb-4" />
                <h3 className="font-serif text-[20px] text-brand-text mb-2">
                  仲未報名任何活動
                </h3>
                <p className="text-[13px] text-brand-softer mb-6 max-w-sm mx-auto">
                  探索創研社嘅商業講座、工作坊及交流會，立即加入學習。
                </p>
                <Link href="/events" className="pill-btn-primary">
                  立即瀏覽活動
                </Link>
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <div className="mb-5 pb-3 border-b border-brand-hair">
                <div className="eyebrow-muted mb-2">歷史記錄</div>
                <h2 className="font-serif text-[24px] text-brand-text">
                  已參加 ({past.length})
                </h2>
              </div>
              <div className="space-y-3">
                {past.map((r) =>
                  r.event ? (
                    <RegistrationCard
                      key={r.id}
                      event={r.event}
                      sessionDate={r.registeredSession?.startDate}
                      sessionLocation={r.registeredSession?.location}
                      hasMultipleSessions={(r.event.sessions?.length ?? 0) > 1}
                      cancelled={r.status === "cancelled"}
                      compact
                    />
                  ) : null
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="py-2.5 border-b border-brand-hair last:border-b-0">
      <div className="flex items-center gap-1.5 text-[10px] text-brand-softer tracking-[0.15em] uppercase mb-1">
        {icon}
        {label}
      </div>
      <div className="text-[14px] text-brand-text">{value}</div>
    </div>
  );
}

function RegistrationCard({
  event,
  sessionDate,
  sessionLocation,
  hasMultipleSessions,
  cancelled,
  compact,
}: {
  event: {
    id: string;
    title: string;
    coverImage?: string;
    eventDate: unknown;
    eventType: string;
    category: string;
    location?: string;
    isFree: boolean;
    priceHkd: number;
  };
  sessionDate?: unknown;
  sessionLocation?: string;
  hasMultipleSessions?: boolean;
  cancelled?: boolean;
  compact?: boolean;
}) {
  const displayDate = sessionDate ?? event.eventDate;
  const displayLocation = sessionLocation ?? event.location;
  return (
    <Link
      href={`/events/${event.id}`}
      className={`flex gap-4 glass-card rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all ${
        compact ? "p-4" : "p-4 lg:p-5"
      }`}
    >
      {event.coverImage ? (
        <div
          className={`relative flex-shrink-0 bg-brand-bg overflow-hidden rounded-xl ${
            compact ? "w-20 h-20" : "w-24 h-24 lg:w-32 lg:h-32"
          }`}
        >
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={`flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-light/50 to-brand-accent/20 flex items-center justify-center ${
            compact ? "w-20 h-20" : "w-24 h-24 lg:w-32 lg:h-32"
          }`}
        >
          <span className="font-serif text-xl text-brand-dark/30">研</span>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="pill-tag-accent">{categoryLabel(event.category)}</span>
          <span className="pill-tag">{eventTypeLabel(event.eventType)}</span>
          {hasMultipleSessions && !cancelled && (
            <span className="inline-flex items-center bg-brand-bg text-brand-dark border border-brand-rule px-2.5 py-[2px] rounded-full text-[10px] font-semibold tracking-wider">
              你揀咗呢場
            </span>
          )}
          {cancelled && (
            <span className="inline-flex items-center bg-red-50 text-red-700 px-2.5 py-[2px] rounded-full text-[10px] font-semibold tracking-wider">
              已取消
            </span>
          )}
        </div>
        <div
          className={`font-semibold text-brand-text leading-snug ${
            compact ? "text-[14px]" : "text-[15px] lg:text-[16px]"
          }`}
        >
          {event.title}
        </div>
        <div className="flex items-center gap-3 text-[12px] text-brand-softer mt-2">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatEventDate(displayDate as never)}
          </span>
          {event.eventType !== "online" && displayLocation && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </span>
          )}
          {event.eventType === "online" && (
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" /> 線上
            </span>
          )}
        </div>
        {!compact && (
          <div className="mt-auto pt-2 flex items-center gap-2">
            <span className="text-[11px] text-brand-softer">票種</span>
            <span className="text-[12px] font-semibold text-brand-dark">
              {priceLabel(event.isFree, event.priceHkd)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
