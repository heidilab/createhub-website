import { resend, FROM, SITE_URL, ADMIN_EMAIL } from "@/lib/resend";
import { adminDb } from "@/lib/firebase/admin";
import EventConfirmationEmail from "@/emails/EventConfirmationEmail";
import RegistrationNotificationEmail from "@/emails/RegistrationNotificationEmail";
import { formatEventDate } from "@/lib/date";

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
  bio?: string;
  photoUrl?: string;
}

interface SendArgs {
  eventId: string;
  sessionId: string;
  attendee: {
    email: string;
    name: string;
    whatsapp?: string;
  };
}

/**
 * After a registration is confirmed (free immediately, paid after webhook),
 * sends:
 *   1. Confirmation email to the attendee
 *   2. Notification email to info@createhub.biz
 *   3. Notification email to each speaker email configured on the event
 *
 * All sends are best-effort — failures are logged but do not throw.
 */
export async function sendRegistrationEmails({
  eventId,
  sessionId,
  attendee,
}: SendArgs): Promise<void> {
  if (!resend) return;

  try {
    const db = adminDb();
    const eventSnap = await db.collection("events").doc(eventId).get();
    if (!eventSnap.exists) return;
    const event = eventSnap.data()!;

    // Resolve session (back-compat: fall back to event-level fields)
    const sessions = Array.isArray(event.sessions)
      ? (event.sessions as SessionShape[])
      : [];
    const session: SessionShape | undefined =
      sessions.find((s) => s.id === sessionId) ??
      sessions[0] ?? {
        id: "default",
        startDate: event.eventDate,
        endDate: event.endDate,
        location: event.location ?? null,
        zoomLink: event.zoomLink ?? null,
        capacity: event.capacity ?? null,
      };

    const speakers = Array.isArray(event.speakers)
      ? (event.speakers as SpeakerShape[])
      : event.speakerName
        ? [{ name: event.speakerName as string }]
        : [];
    const speakerNames = speakers
      .map((s) => s?.name?.trim())
      .filter((n): n is string => !!n)
      .join(", ");

    const eventUrl = `${SITE_URL}/events/${eventId}`;
    const isOnline = event.eventType === "online";
    const sessionDateText = session?.startDate
      ? formatEventDate(session.startDate as string | Date)
      : formatEventDate(event.eventDate);
    const sessionLocation =
      (session?.location as string | undefined) ??
      (event.location as string | undefined) ??
      "";
    const sessionZoom =
      (session?.zoomLink as string | undefined) ??
      (event.zoomLink as string | undefined) ??
      "";

    // ── 1. Attendee confirmation ───────────────────────────────
    try {
      await resend.emails.send({
        from: FROM,
        to: attendee.email,
        subject: `【報名確認】${event.title} — 創研社 CREATE HUB`,
        react: EventConfirmationEmail({
          fullName: attendee.name || attendee.email,
          eventTitle: event.title,
          eventDateText: sessionDateText,
          location: sessionLocation,
          isOnline,
          zoomLink: sessionZoom,
          speakerNames,
          eventUrl,
        }),
      });
    } catch (err) {
      console.warn("[notifications] attendee email failed:", err);
    }

    // ── 2 + 3. Admin + speaker notifications ───────────────────
    const speakerEmails = Array.isArray(event.speakerEmails)
      ? (event.speakerEmails as string[]).filter((e) => typeof e === "string")
      : [];

    // Count current registrations for this session (post-insert count)
    let registeredCount = 0;
    try {
      const countSnap = await db
        .collection("registrations")
        .where("eventId", "==", eventId)
        .where("sessionId", "==", sessionId)
        .where("paymentStatus", "in", ["paid", "free"])
        .count()
        .get();
      registeredCount = countSnap.data().count;
    } catch {
      // Older registrations may not have sessionId — do a fallback count
      const fallback = await db
        .collection("registrations")
        .where("eventId", "==", eventId)
        .where("paymentStatus", "in", ["paid", "free"])
        .count()
        .get();
      registeredCount = fallback.data().count;
    }

    const recipients: { email: string; label: string }[] = [
      { email: ADMIN_EMAIL, label: "管理員" },
      ...speakerEmails
        .filter((e) => e.toLowerCase() !== ADMIN_EMAIL.toLowerCase())
        .map((email) => ({ email, label: "講師" })),
    ];

    const adminEventUrl = `${SITE_URL}/admin/events/${eventId}/edit`;

    await Promise.all(
      recipients.map(async ({ email, label }) => {
        try {
          await resend!.emails.send({
            from: FROM,
            to: email,
            subject: `【新報名】${event.title} — ${attendee.name || attendee.email}`,
            react: RegistrationNotificationEmail({
              recipientLabel: label,
              attendeeName: attendee.name || "—",
              attendeeEmail: attendee.email,
              attendeeWhatsapp: attendee.whatsapp,
              eventTitle: event.title,
              eventDateText: sessionDateText,
              location: sessionLocation,
              isOnline,
              totalRegistered: registeredCount,
              capacity:
                typeof session?.capacity === "number" ? session.capacity : null,
              adminEventUrl,
            }),
          });
        } catch (err) {
          console.warn(
            `[notifications] notification email to ${email} failed:`,
            err
          );
        }
      })
    );
  } catch (err) {
    console.warn("[notifications] sendRegistrationEmails failed:", err);
  }
}
