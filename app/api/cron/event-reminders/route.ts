import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM, SITE_URL } from "@/lib/resend";
import EventReminderEmail from "@/emails/EventReminderEmail";
import { toDate, formatEventDate } from "@/lib/date";

export const runtime = "nodejs";
// Allow up to 60s — cron may send many emails
export const maxDuration = 60;

const HKT_OFFSET_MS = 8 * 60 * 60 * 1000;

interface SessionShape {
  id: string;
  startDate?: unknown;
  endDate?: unknown;
  location?: string | null;
  zoomLink?: string | null;
  capacity?: number | null;
}

interface SpeakerShape {
  name?: string;
}

interface ReminderWindow {
  daysUntil: 1 | 2;
  /** Field on the registration doc that records idempotency for this window. */
  flagField: "reminderSentAt" | "reminderTwoDaysSentAt";
  /** HKT YYYY-MM-DD date string we're targeting (today + daysUntil). */
  targetHKT: string;
  /** Subject prefix wording. */
  whenLabel: "聽日" | "後日";
}

/**
 * Returns the YYYY-MM-DD HKT date string for a Date (UTC instant).
 */
function hktDateString(d: Date): string {
  const t = new Date(d.getTime() + HKT_OFFSET_MS);
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  const day = String(t.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(req: Request) {
  // ── Auth ─────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Resend not configured", sent: 0 },
      { status: 503 }
    );
  }

  const now = new Date();
  const windows: ReminderWindow[] = [
    {
      daysUntil: 1,
      flagField: "reminderSentAt",
      targetHKT: hktDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
      whenLabel: "聽日",
    },
    {
      daysUntil: 2,
      flagField: "reminderTwoDaysSentAt",
      targetHKT: hktDateString(
        new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      ),
      whenLabel: "後日",
    },
  ];

  const db = adminDb();

  // Fetch all upcoming events within a window (covers any session starting in next ~8 days).
  const horizon = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
  const eventsSnap = await db
    .collection("events")
    .where("isPublished", "==", true)
    .where("eventDate", ">=", now)
    .where("eventDate", "<=", horizon)
    .get();

  let totalSent = 0;
  let totalFailed = 0;
  const summary: Array<{
    daysUntil: number;
    eventId: string;
    sessionId: string;
    recipients: number;
  }> = [];

  for (const eventDoc of eventsSnap.docs) {
    const event = eventDoc.data();
    const eventId = eventDoc.id;

    const sessions: SessionShape[] = Array.isArray(event.sessions)
      ? event.sessions
      : [
          {
            id: "default",
            startDate: event.eventDate,
            endDate: event.endDate,
            location: event.location ?? null,
            zoomLink: event.zoomLink ?? null,
            capacity: event.capacity ?? null,
          },
        ];

    const speakers: SpeakerShape[] = Array.isArray(event.speakers)
      ? event.speakers
      : event.speakerName
        ? [{ name: event.speakerName as string }]
        : [];
    const speakerNames = speakers
      .map((s) => s?.name?.trim())
      .filter((n): n is string => !!n)
      .join(", ");

    const isOnline = event.eventType === "online";
    const eventUrl = `${SITE_URL}/events/${eventId}`;

    // For each window, find matching sessions and send.
    for (const w of windows) {
      const matchedSessions = sessions.filter((s) => {
        const d = toDate(s.startDate as string | Date | null | undefined);
        if (!d) return false;
        return hktDateString(d) === w.targetHKT;
      });
      if (matchedSessions.length === 0) continue;

      for (const sess of matchedSessions) {
        // Fetch confirmed registrations for this session
        const regSnap = await db
          .collection("registrations")
          .where("eventId", "==", eventId)
          .where("sessionId", "==", sess.id)
          .where("paymentStatus", "in", ["paid", "free"])
          .get();

        // Back-compat: if "default" session and no registrations have a sessionId,
        // fall back to event-level registrations
        let regs = regSnap.docs;
        if (sess.id === "default" && regs.length === 0) {
          const fallback = await db
            .collection("registrations")
            .where("eventId", "==", eventId)
            .where("paymentStatus", "in", ["paid", "free"])
            .get();
          regs = fallback.docs.filter((d) => {
            const sid = (d.data() as { sessionId?: string }).sessionId;
            return !sid || sid === "default";
          });
        }

        const sessionDateText = formatEventDate(
          sess.startDate as string | Date | null | undefined
        );
        const sessionLocation =
          (sess.location as string | undefined) ??
          (event.location as string | undefined) ??
          "";
        const sessionZoom =
          (sess.zoomLink as string | undefined) ??
          (event.zoomLink as string | undefined) ??
          "";

        let recipientsCount = 0;

        await Promise.all(
          regs.map(async (regDoc) => {
            const reg = regDoc.data() as {
              userEmail?: string;
              userName?: string;
              reminderSentAt?: unknown;
              reminderTwoDaysSentAt?: unknown;
            };
            if (!reg.userEmail) return;
            // Idempotency: skip if THIS window's reminder already sent
            if (reg[w.flagField]) return;

            try {
              await resend!.emails.send({
                from: FROM,
                to: reg.userEmail,
                subject: `【提醒】${w.whenLabel}見：${event.title}`,
                react: EventReminderEmail({
                  fullName: reg.userName || reg.userEmail,
                  eventTitle: event.title,
                  eventDateText: sessionDateText,
                  location: sessionLocation,
                  isOnline,
                  zoomLink: sessionZoom,
                  speakerNames,
                  eventUrl,
                  daysUntil: w.daysUntil,
                }),
              });
              await regDoc.ref.update({ [w.flagField]: new Date() });
              totalSent += 1;
              recipientsCount += 1;
            } catch (err) {
              console.warn(
                `[cron reminder T-${w.daysUntil}] failed for`,
                reg.userEmail,
                ":",
                err
              );
              totalFailed += 1;
            }
          })
        );

        summary.push({
          daysUntil: w.daysUntil,
          eventId,
          sessionId: sess.id,
          recipients: recipientsCount,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    windows: windows.map((w) => ({
      daysUntil: w.daysUntil,
      targetHKT: w.targetHKT,
    })),
    sent: totalSent,
    failed: totalFailed,
    summary,
  });
}
