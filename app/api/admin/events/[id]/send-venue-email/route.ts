import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM, SITE_URL } from "@/lib/resend";
import VenueInfoEmail from "@/emails/VenueInfoEmail";
import { formatEventDate } from "@/lib/date";

export const runtime = "nodejs";
export const maxDuration = 60;

interface SessionShape {
  id: string;
  startDate?: unknown;
}

/**
 * One-off blast: sends a venue-address supplement email to every confirmed
 * (paid/free) registration of this event. Idempotent per registration via
 * the `venueEmailSentAt` flag — safe to trigger multiple times.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Resend 未設定" },
      { status: 503 }
    );
  }

  const { venueAddress, mapUrl } = (await req.json()) as {
    venueAddress?: string;
    mapUrl?: string;
  };
  if (!venueAddress?.trim()) {
    return NextResponse.json({ error: "請提供活動地址" }, { status: 400 });
  }

  const db = adminDb();
  const eventSnap = await db.collection("events").doc(params.id).get();
  if (!eventSnap.exists) {
    return NextResponse.json({ error: "活動不存在" }, { status: 404 });
  }
  const event = eventSnap.data()!;

  const sessions: SessionShape[] = Array.isArray(event.sessions)
    ? event.sessions
    : [{ id: "default", startDate: event.eventDate }];
  const sessionMap: Record<string, SessionShape> = {};
  for (const s of sessions) sessionMap[s.id] = s;

  const regSnap = await db
    .collection("registrations")
    .where("eventId", "==", params.id)
    .where("paymentStatus", "in", ["paid", "free"])
    .get();

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  await Promise.all(
    regSnap.docs.map(async (regDoc) => {
      const reg = regDoc.data() as {
        userEmail?: string;
        userName?: string;
        sessionId?: string;
        status?: string;
        venueEmailSentAt?: unknown;
      };
      if (!reg.userEmail || reg.status === "cancelled") {
        skipped += 1;
        return;
      }
      if (reg.venueEmailSentAt) {
        skipped += 1;
        return;
      }

      const session = sessionMap[reg.sessionId ?? "default"];
      const dateText = session?.startDate
        ? formatEventDate(session.startDate as string | Date)
        : formatEventDate(event.eventDate);

      try {
        await resend!.emails.send({
          from: FROM,
          to: reg.userEmail,
          subject: `【活動地點補充】${event.title} — 創研社 CREATE HUB`,
          react: VenueInfoEmail({
            fullName: reg.userName || reg.userEmail,
            eventTitle: event.title,
            eventDateText: dateText,
            venueAddress: venueAddress.trim(),
            mapUrl: mapUrl?.trim() || "",
            eventUrl: `${SITE_URL}/events/${params.id}`,
          }),
        });
        await regDoc.ref.update({ venueEmailSentAt: new Date() });
        sent += 1;
      } catch (err) {
        console.warn("[venue email] failed for", reg.userEmail, ":", err);
        failed += 1;
      }
    })
  );

  return NextResponse.json({ ok: true, sent, skipped, failed });
}
