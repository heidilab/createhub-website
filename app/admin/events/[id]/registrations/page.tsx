import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { getEventById } from "@/lib/events";
import { formatEventDate } from "@/lib/date";
import { serializeDate } from "@/lib/serialize";
import RegistrationsTable from "@/components/admin/RegistrationsTable";

export const dynamic = "force-dynamic";

export const metadata = { title: "查看報名名單" };

interface UserDoc {
  whatsapp?: string;
  fullName?: string;
}

export default async function AdminRegistrationsPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventById(params.id);
  if (!event) notFound();

  const db = adminDb();

  // Fetch all registrations for this event
  const regSnap = await db
    .collection("registrations")
    .where("eventId", "==", params.id)
    .get();

  // Hydrate user profiles for whatsapp + name
  const userIds = Array.from(
    new Set(
      regSnap.docs
        .map((d) => (d.data() as { userId?: string }).userId)
        .filter((u): u is string => !!u)
    )
  );
  const userMap = new Map<string, UserDoc>();
  await Promise.all(
    userIds.map(async (uid) => {
      const us = await db.collection("users").doc(uid).get();
      if (us.exists) userMap.set(uid, us.data() as UserDoc);
    })
  );

  // Build serializable rows
  const rows = regSnap.docs
    .map((d) => {
      const r = d.data() as {
        userId?: string;
        userName?: string;
        userEmail?: string;
        sessionId?: string;
        paymentStatus?: string;
        status?: string;
        registeredAt?: unknown;
      };
      const profile = r.userId ? userMap.get(r.userId) : undefined;
      return {
        id: d.id,
        sessionId: r.sessionId ?? "default",
        name: r.userName ?? profile?.fullName ?? "—",
        email: r.userEmail ?? "—",
        whatsapp: profile?.whatsapp ?? "",
        status: r.status ?? "confirmed",
        paymentStatus: r.paymentStatus ?? "free",
        registeredAt: serializeDate(r.registeredAt) ?? null,
      };
    })
    .sort((a, b) => (b.registeredAt ?? "").localeCompare(a.registeredAt ?? ""));

  // All published events (for the "move to other event" picker)
  const allEventsSnap = await db
    .collection("events")
    .orderBy("eventDate", "desc")
    .get();
  const allEvents = allEventsSnap.docs.map((d) => {
    const data = d.data();
    const sessions = Array.isArray(data.sessions)
      ? data.sessions
      : [
          {
            id: "default",
            startDate: data.eventDate,
            location: data.location ?? null,
          },
        ];
    return {
      id: d.id,
      title: (data.title as string) ?? "",
      sessions: sessions.map(
        (s: {
          id?: unknown;
          startDate?: unknown;
          location?: unknown;
        }) => ({
          id: (s.id as string) ?? "default",
          startDate: serializeDate(s.startDate) ?? "",
          location: (s.location as string | undefined) ?? null,
        })
      ),
    };
  });

  // Group rows by session
  const grouped: Record<string, typeof rows> = {};
  for (const r of rows) {
    if (!grouped[r.sessionId]) grouped[r.sessionId] = [];
    grouped[r.sessionId].push(r);
  }

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-dark mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        返回活動管理
      </Link>

      <header className="mb-8 pb-5 border-b border-brand-hair">
        <div className="eyebrow-muted mb-3">Registration List</div>
        <h1 className="font-serif text-[28px] lg:text-[32px] text-brand-text">
          {event.title}
        </h1>
        <p className="text-[13px] text-brand-softer mt-2">
          共 {rows.length} 個報名記錄 · {event.sessions.length} 場活動
        </p>
      </header>

      {/* Export buttons */}
      <div className="flex items-center gap-3 mb-8">
        <a
          href={`/api/admin/events/${event.id}/registrations/export?format=xlsx`}
          className="inline-flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 text-[13px] font-bold tracking-wide hover:bg-brand-text transition"
        >
          匯出 Excel
        </a>
        <a
          href={`/api/admin/events/${event.id}/registrations/export?format=html`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-brand-rule text-brand-dark px-5 py-2.5 text-[13px] font-bold tracking-wide hover:border-brand-accent transition"
        >
          匯出 PDF（列印）
        </a>
      </div>

      <RegistrationsTable
        eventId={event.id}
        sessions={event.sessions.map((s) => ({
          id: s.id,
          startDate:
            typeof s.startDate === "string"
              ? s.startDate
              : (serializeDate(s.startDate) ?? ""),
          location: s.location ?? null,
        }))}
        groupedRows={Object.entries(grouped).map(([sid, rs]) => {
          const session = event.sessions.find((s) => s.id === sid);
          return {
            sessionId: sid,
            sessionLabel: session
              ? `${formatEventDate(session.startDate)}${
                  session.location ? ` · ${session.location}` : ""
                }`
              : "（未指定場次 / 舊資料）",
            rows: rs,
          };
        })}
        allEvents={allEvents}
      />
    </div>
  );
}
