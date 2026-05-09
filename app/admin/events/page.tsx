import Link from "next/link";
import { Plus, Edit2, Users } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { formatEventDate } from "@/lib/date";
import { categoryLabel, eventTypeLabel } from "@/lib/utils";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

async function getAllEvents(): Promise<
  Array<Event & { registrationCount: number }>
> {
  const db = adminDb();
  try {
    const snap = await db
      .collection("events")
      .orderBy("eventDate", "desc")
      .get();
    const events = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<Event, "id">) } as Event)
    );

    const withCounts = await Promise.all(
      events.map(async (e) => {
        let count = 0;
        try {
          const c = await db
            .collection("registrations")
            .where("eventId", "==", e.id)
            .where("status", "==", "confirmed")
            .count()
            .get();
          count = c.data().count;
        } catch {}
        return { ...e, registrationCount: count };
      })
    );
    return withCounts;
  } catch (err) {
    console.warn("[admin events list]", err);
    return [];
  }
}

export default async function AdminEventsPage() {
  const events = await getAllEvents();

  return (
    <div className="p-8 lg:p-12">
      <header className="flex items-end justify-between mb-10 pb-5 border-b border-brand-hair">
        <div>
          <div className="eyebrow-muted mb-3">Events</div>
          <h1 className="font-serif text-[32px] text-brand-text">活動管理</h1>
          <p className="text-[13px] text-brand-softer mt-2">
            建立、編輯、發布活動；管理報名與名額
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 text-[13px] font-bold tracking-wide hover:bg-brand-text transition"
        >
          <Plus className="w-4 h-4" />
          建立新活動
        </Link>
      </header>

      {events.length > 0 ? (
        <div className="bg-white border border-brand-hair overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-brand-bg border-b border-brand-hair">
              <tr className="text-left">
                <Th>活動名稱</Th>
                <Th>類別 / 形式</Th>
                <Th>日期</Th>
                <Th>報名</Th>
                <Th>狀態</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-hair">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-brand-bg/50">
                  <td className="p-3">
                    <div className="font-semibold text-brand-text max-w-xs truncate">
                      {e.title}
                    </div>
                    {e.speakerName && (
                      <div className="text-[11px] text-brand-softer mt-0.5">
                        {e.speakerName}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <span className="tag-type">{categoryLabel(e.category)}</span>
                      <span className="tag-loc">{eventTypeLabel(e.eventType)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-brand-muted whitespace-nowrap">
                    {formatEventDate(e.eventDate)}
                  </td>
                  <td className="p-3">
                    <span className="font-serif text-[16px] text-brand-dark font-bold">
                      {e.registrationCount}
                    </span>
                    {e.capacity && (
                      <span className="text-[11px] text-brand-softer"> / {e.capacity}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge
                      isPublished={e.isPublished}
                      status={e.status}
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/events/${e.id}/registrations`}
                        className="inline-flex items-center gap-1 text-brand-dark hover:text-brand-accent font-semibold"
                      >
                        <Users className="w-3 h-3" />
                        查看報名名單
                      </Link>
                      <span className="text-brand-hair">|</span>
                      <Link
                        href={`/admin/events/${e.id}/edit`}
                        className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-dark"
                      >
                        <Edit2 className="w-3 h-3" />
                        編輯
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-brand-rule p-16 text-center">
          <div className="eyebrow-muted mb-3">No Events</div>
          <div className="rule-accent mx-auto mb-5" />
          <h2 className="font-serif text-[24px] text-brand-text mb-3">
            未有任何活動
          </h2>
          <p className="text-[13px] text-brand-softer mb-6 max-w-sm mx-auto">
            建立第一個活動，讓你嘅會員可以報名參加
          </p>
          <Link href="/admin/events/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            建立新活動
          </Link>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="p-3 text-[10px] text-brand-softer tracking-[0.15em] uppercase font-semibold">
      {children}
    </th>
  );
}

function StatusBadge({
  isPublished,
  status,
}: {
  isPublished: boolean;
  status: string;
}) {
  if (!isPublished)
    return (
      <span className="text-[10px] bg-brand-softer/20 text-brand-softer px-2 py-[2px] font-semibold tracking-wider">
        草稿
      </span>
    );
  if (status === "cancelled")
    return (
      <span className="text-[10px] bg-red-50 text-red-700 px-2 py-[2px] font-semibold tracking-wider">
        已取消
      </span>
    );
  if (status === "past")
    return (
      <span className="text-[10px] bg-brand-hair text-brand-muted px-2 py-[2px] font-semibold tracking-wider">
        過往
      </span>
    );
  return (
    <span className="text-[10px] bg-brand-accent/20 text-brand-dark px-2 py-[2px] font-semibold tracking-wider">
      已發布
    </span>
  );
}
