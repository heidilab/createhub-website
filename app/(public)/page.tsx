import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Calendar, Users } from "lucide-react";
import EventListItem from "@/components/events/EventListItem";
import YouTubeSection from "@/components/home/YouTubeSection";
import InstagramFeed from "@/components/home/InstagramFeed";
import RotatingFounderCard from "@/components/home/RotatingFounderCard";
import { getUpcomingEvents } from "@/lib/events";
import { getVisibleTeamMembers } from "@/lib/team";
import { toDate } from "@/lib/date";
import { SITE } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

const STATS = [
  { num: "200+", label: "活躍會員", suffix: "" },
  { num: "30+", label: "已舉辦活動", suffix: "" },
  { num: "120", label: "創辦人管理企業實績", prefix: "HK$", suffix: "M+" },
  { num: "4", label: "跨領域專業創辦人", suffix: "" },
];

const PILLARS = [
  {
    num: "01",
    title: "線上學習平台",
    desc: "由業界專家主講，隨時隨地掌握市場營銷、品牌建立、財務管理及 AI 應用等商業核心知識。",
    href: SITE.learnworldsUrl,
    external: true,
    link: "探索課程",
    badge: "Online Learning",
  },
  {
    num: "02",
    title: "線上 / 線下活動",
    desc: "講座、工作坊及交流會，與業界精英建立真實人脈，將知識轉化為實戰能力。",
    href: "/events",
    external: false,
    link: "查看活動",
    badge: "Events",
  },
  {
    num: "03",
    title: "認識創研社團隊",
    desc: "四位創辦人橫跨國際貿易、工商管理、活動策劃與財務會計，帶來真實商業實戰經驗。",
    href: "/about",
    external: false,
    link: "認識團隊",
    badge: "Our Team",
  },
];

export default async function HomePage() {
  const [events, team] = await Promise.all([
    getUpcomingEvents(3),
    getVisibleTeamMembers(),
  ]);

  const nextEvent = events[0];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      {/* ──────────── HERO ──────────── */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Watermark text */}
        <div className="absolute inset-0 flex items-start justify-center pt-12 pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[14vw] sm:text-[12vw] lg:text-[15rem] leading-none whitespace-nowrap"
          >
            CREATE&nbsp;HUB
          </h2>
        </div>

        <div className="relative container-edge px-5 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[600px]">
            {/* LEFT — Editorial */}
            <div className="lg:col-span-7 relative z-20">
              <div className="pill-tag mb-6">
                <Sparkles className="w-3 h-3 mr-1.5 text-brand-accent" />
                Hong Kong Business Education
              </div>

              <h1 className="font-serif text-[48px] sm:text-[64px] lg:text-[80px] xl:text-[96px] leading-[0.95] tracking-tight text-brand-text mb-7">
                學以致用
                <br />
                <em className="not-italic font-semibold text-brand-dark">
                  <span className="italic font-serif">創</span>出未來
                </em>
              </h1>

              <p className="text-[16px] lg:text-[18px] text-brand-muted leading-[1.85] max-w-[520px] mb-9">
                創研社提供專業課程及實戰活動，助你掌握商業新知識，與業界精英共同成長，開拓無限可能。
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={SITE.learnworldsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn-primary"
                >
                  探索課程
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <Link href="/events" className="pill-btn-outline">
                  <Calendar className="w-3.5 h-3.5" />
                  查看活動
                </Link>
              </div>

              {/* Floating tag pills */}
              <div className="flex flex-wrap gap-2.5 mt-12 max-w-md">
                <span className="pill-tag" style={{ transform: "rotate(-2deg)" }}>
                  創業
                </span>
                <span className="pill-tag-accent" style={{ transform: "rotate(1deg)" }}>
                  Business Education
                </span>
                <span className="pill-tag" style={{ transform: "rotate(-1deg)" }}>
                  工作坊
                </span>
                <span className="pill-tag-dark" style={{ transform: "rotate(2deg)" }}>
                  Networking
                </span>
              </div>
            </div>

            {/* RIGHT — Floating elements */}
            <div className="lg:col-span-5 relative h-[500px] lg:h-[600px]">
              {/* Logo icon — center floating */}
              <div className="absolute top-[18%] lg:top-[8%] left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-[5%] w-[180px] sm:w-[220px] lg:w-[260px] float-soft">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/30 to-brand-light/40 rounded-full blur-3xl" />
                  <Image
                    src="/logo.png"
                    alt="創研社 CREATE HUB"
                    width={1280}
                    height={1024}
                    priority
                    className="relative w-full h-auto drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Profile card — top right (rotating through founders) */}
              {team.length > 0 && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-[40%] z-30 float-soft-delayed max-w-[92vw] lg:max-w-none">
                  <div style={{ transform: "rotate(-3deg)" }}>
                    <RotatingFounderCard founders={team} intervalMs={4000} />
                  </div>
                </div>
              )}

              {/* Stats card — middle left */}
              <div
                className="absolute top-[42%] -left-2 lg:left-[5%] z-30 float-soft"
                style={{ transform: "rotate(-2deg)" }}
              >
                <div className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent to-brand-dark border-2 border-white" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-light to-brand-accent border-2 border-white" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-dark to-brand-text border-2 border-white" />
                  </div>
                  <div>
                    <div className="font-outfit text-[18px] font-bold text-brand-dark leading-none">
                      200+
                    </div>
                    <div className="text-[10px] text-brand-muted tracking-[0.1em] uppercase mt-0.5">
                      Active Members
                    </div>
                  </div>
                </div>
              </div>

              {/* Event card — bottom right */}
              {nextEvent && (
                <Link
                  href={`/events/${nextEvent.id}`}
                  className="absolute bottom-[5%] right-[3%] z-30 float-soft-delayed block"
                  style={{ transform: "rotate(2deg)" }}
                >
                  <div className="glass-card rounded-2xl p-4 max-w-[260px] hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5 text-brand-dark" />
                      </div>
                      <div className="text-[10px] text-brand-accent tracking-[0.15em] uppercase font-bold">
                        Upcoming Event
                      </div>
                    </div>
                    <div className="text-[13px] font-bold text-brand-text leading-snug line-clamp-2">
                      {nextEvent.title}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] text-brand-softer">
                        {(() => {
                          const d = toDate(nextEvent.eventDate);
                          if (!d) return "";
                          return `${d.getMonth() + 1}月${d.getDate()}日`;
                        })()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-brand-accent" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Floating decorative tag — bottom left */}
              <div
                className="absolute bottom-[18%] left-[10%] z-30 float-soft"
                style={{ transform: "rotate(-4deg)" }}
              >
                <div className="pill-tag-dark">Founders × Educators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── PILLARS ──────────── */}
      <section className="relative py-20 lg:py-28 gradient-soft overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="watermark-text text-[12vw] lg:text-[10rem] leading-none whitespace-nowrap opacity-60">
            WHAT WE DO
          </div>
        </div>

        <div className="relative container-wide px-5 lg:px-8">
          <div className="text-center mb-14">
            <div className="pill-tag inline-flex mb-5">
              <Sparkles className="w-3 h-3 mr-1.5 text-brand-accent" />
              Three Core Services
            </div>
            <h2 className="font-serif text-[36px] sm:text-[44px] lg:text-[56px] text-brand-text leading-tight mb-4">
              一站式商業教育生態
            </h2>
            <p className="text-[14px] lg:text-[15px] text-brand-muted max-w-2xl mx-auto leading-relaxed">
              從線上學習到線下實戰，創研社為你提供完整嘅商業成長路徑。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p, idx) => {
              const inner = (
                <div className="relative h-full glass-card rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div
                    className="absolute -top-3 -right-3 z-10"
                    style={{ transform: `rotate(${idx % 2 === 0 ? -3 : 3}deg)` }}
                  >
                    <span className="pill-tag-accent">{p.badge}</span>
                  </div>
                  <div className="font-outfit font-black text-[64px] text-brand-light/40 leading-none mb-3 group-hover:text-brand-accent/60 transition-colors">
                    {p.num}
                  </div>
                  <h3 className="font-serif text-[24px] text-brand-dark mb-3">
                    {p.title}
                  </h3>
                  <p className="text-[13px] text-brand-muted leading-[1.85] mb-6">
                    {p.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-accent group-hover:gap-2.5 transition-all">
                    {p.link}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              );
              return p.external ? (
                <a
                  key={p.num}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <Link key={p.num} href={p.href}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────── STATS ──────────── */}
      <section className="relative py-20 lg:py-24 bg-brand-dark text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #34ccef 0%, transparent 40%), radial-gradient(circle at 80% 70%, #a8eaf7 0%, transparent 40%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="font-outfit font-black uppercase text-[16vw] lg:text-[14rem] leading-none whitespace-nowrap"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(168, 234, 247, 0.06)",
            }}
            aria-hidden="true"
          >
            BY&nbsp;THE&nbsp;NUMBERS
          </div>
        </div>

        <div className="relative container-wide px-5 lg:px-8">
          <div className="text-center mb-14">
            <div
              className="pill-tag-accent inline-flex mb-5"
              style={{ background: "rgba(52, 204, 239, 0.15)", color: "#a8eaf7" }}
            >
              By The Numbers
            </div>
            <h2 className="font-serif text-[36px] sm:text-[44px] lg:text-[56px] text-white leading-tight mb-3">
              數字背後嘅實力
            </h2>
            <p className="text-[14px] text-white/70 max-w-2xl mx-auto">
              四位資深創辦人嘅 真實商業經驗 × 教育能量
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="glass-card-dark rounded-3xl p-7 text-center"
              >
                <div className="font-outfit text-[40px] sm:text-[52px] lg:text-[64px] font-black text-white leading-none mb-2">
                  {s.prefix && (
                    <span className="text-[26px] lg:text-[36px] text-brand-accent align-top mr-1">
                      {s.prefix}
                    </span>
                  )}
                  {s.num}
                  {s.suffix && (
                    <span className="text-brand-accent">{s.suffix}</span>
                  )}
                </div>
                <div className="text-[11px] text-brand-accent/80 tracking-[0.15em] uppercase mt-3">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── EVENTS PREVIEW ──────────── */}
      <section className="py-20 lg:py-28 gradient-soft">
        <div className="container-wide px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10 pb-5 border-b border-brand-hair">
            <div>
              <div className="pill-tag mb-4">
                <Calendar className="w-3 h-3 mr-1.5 text-brand-accent" />
                Upcoming Events
              </div>
              <h2 className="font-serif text-[32px] lg:text-[44px] text-brand-text leading-tight">
                即將舉行活動
              </h2>
            </div>
            <Link href="/events" className="pill-btn-outline self-start">
              查看全部
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="glass-card rounded-3xl p-3 sm:p-5">
              {events.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center">
              <Calendar className="w-10 h-10 text-brand-accent mx-auto mb-4" />
              <div className="text-[15px] text-brand-text font-semibold mb-2">
                活動籌備中
              </div>
              <p className="text-[13px] text-brand-softer max-w-md mx-auto mb-5">
                密切留意即將公布嘅新活動
              </p>
              <Link href="/events" className="pill-btn-outline">
                瀏覽過往活動
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ──────────── YOUTUBE ──────────── */}
      <YouTubeSection />

      {/* ──────────── PHILOSOPHY ──────────── */}
      <section className="py-20 lg:py-28 gradient-soft relative overflow-hidden">
        <div className="container-narrow px-5 text-center relative">
          <div className="pill-tag inline-flex mb-6">
            <Users className="w-3 h-3 mr-1.5 text-brand-accent" />
            Our Philosophy
          </div>
          <blockquote className="font-serif text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.4] text-brand-text max-w-3xl mx-auto italic">
            &ldquo;真正的商業教育，
            <br />
            係將經驗轉化為下一代的
            <strong className="not-italic font-semibold text-brand-dark">
              養份
            </strong>
            。&rdquo;
          </blockquote>
          <div className="mt-10 text-[12px] text-brand-softer tracking-[0.25em] uppercase">
            — Create Hub Founders
          </div>
        </div>
      </section>

      {/* ──────────── INSTAGRAM FEED ──────────── */}
      <InstagramFeed />

      {/* ──────────── CTA ──────────── */}
      <section className="relative py-20 lg:py-28 bg-brand-dark text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #34ccef 0%, transparent 50%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="font-outfit font-black uppercase text-[18vw] lg:text-[14rem] leading-none whitespace-nowrap"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(52, 204, 239, 0.08)",
            }}
            aria-hidden="true"
          >
            JOIN&nbsp;US
          </div>
        </div>

        <div className="relative container-narrow px-5 text-center">
          <div
            className="pill-tag-accent inline-flex mb-6"
            style={{ background: "rgba(52, 204, 239, 0.15)", color: "#a8eaf7" }}
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Join Us Today
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] lg:text-[56px] text-white leading-tight mb-5">
            準備好踏出第一步？
          </h2>
          <p className="text-[14px] lg:text-[16px] text-white/75 max-w-xl mx-auto mb-10 leading-relaxed">
            立即加入創研社，與我哋一齊建立你嘅商業知識版圖。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link href="/register" className="pill-btn-accent">
              立即免費加入
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="pill-btn-outline"
              style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            >
              聯絡我們
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
