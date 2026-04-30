import Link from "next/link";
import { ArrowRight, Users, CalendarDays, Ticket, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { getAdminStats } from "@/lib/admin-stats";
import { adminDb } from "@/lib/firebase/admin";
import { formatEventDate } from "@/lib/date";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const stats = await getAdminStats();

  // Fetch recent events + recent registrations for quick glance
  const db = adminDb();
  const now = new Date();
  let recentEvents: Event[] = [];
  try {
    const snap = await db
      .collection("events")
      .where("eventDate", ">=", now)
      .orderBy("eventDate", "asc")
      .limit(5)
      .get();
    recentEvents = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<Event, "id">) } as Event)
    );
  } catch {
    recentEvents = [];
  }

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <div className="eyebrow-muted mb-3">Dashboard</div>
        <h1 className="font-serif text-[36px] text-brand-text">總覽</h1>
        <p className="text-[13px] text-brand-softer mt-2">
          即時掌握創研社嘅數據與最新活動狀態
        </p>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="總會員數"
          value={stats.totalMembers}
          icon={<Users className="w-4 h-4" />}
          href="/admin/members"
        />
        <StatCard
          label="即將活動"
          value={stats.upcomingEvents}
          icon={<CalendarDays className="w-4 h-4" />}
          href="/admin/events"
        />
        <StatCard
          label="今日報名"
          value={stats.todayRegistrations}
          icon={<TrendingUp className="w-4 h-4" />}
          accent
        />
        <StatCard
          label="總報名數"
          value={stats.totalRegistrations}
          icon={<Ticket className="w-4 h-4" />}
        />
        <StatCard
          label="Newsletter 訂閱"
          value={stats.newsletterSubscribers}
          icon={<Mail className="w-4 h-4" />}
          href="/admin/newsletter"
        />
        <StatCard
          label="未讀查詢"
          value={stats.unreadInquiries}
          icon={<MessageSquare className="w-4 h-4" />}
          accent={stats.unreadInquiries > 0}
        />
      </section>

      {/* Upcoming events */}
      <section>
        <div className="flex items-end justify-between mb-5 pb-3 border-b border-brand-hair">
          <div>
            <div className="eyebrow-muted mb-2">即將活動</div>
            <h2 className="font-serif text-[22px] text-brand-text">
              未來 5 個活動
            </h2>
          </div>
          <Link href="/admin/events" className="btn-secondary-link">
            查看全部
          </Link>
        </div>

        {recentEvents.length > 0 ? (
          <div className="bg-white border border-brand-hair divide-y divide-brand-hair">
            {recentEvents.map((e) => (
              <Link
                key={e.id}
                href={`/admin/events/${e.id}/edit`}
                className="flex items-center justify-between p-4 hover:bg-brand-bg transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-brand-text truncate">
                      {e.title}
                    </span>
                    {!e.isPublished && (
                      <span className="text-[9px] bg-brand-softer/20 text-brand-softer px-1.5 py-[1px] tracking-wider">
                        草稿
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-brand-softer">
                    {formatEventDate(e.eventDate)}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-softer" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-brand-rule p-10 text-center">
            <CalendarDays className="w-8 h-8 text-brand-accent mx-auto mb-3" />
            <p className="text-[13px] text-brand-softer mb-4">
              暫未有即將舉行嘅活動
            </p>
            <Link href="/admin/events/new" className="btn-primary">
              建立新活動
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <div
      className={`p-5 border transition ${
        accent
          ? "bg-brand-accent/10 border-brand-accent"
          : "bg-white border-brand-hair hover:border-brand-accent"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-brand-softer tracking-[0.2em] uppercase font-semibold">
          {label}
        </div>
        <div className="text-brand-accent">{icon}</div>
      </div>
      <div className="font-serif text-[32px] text-brand-text leading-none">
        {value}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
