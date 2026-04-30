import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM, SITE_URL } from "@/lib/resend";
import NewsletterEmail from "@/emails/NewsletterEmail";
import { formatEventDate } from "@/lib/date";
import { categoryLabel, eventTypeLabel } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Resend API key 未設定，請先設定 .env.local" },
      { status: 500 }
    );
  }

  try {
    const { subject, content, includeEvents } = await req.json();
    if (!subject || !content) {
      return NextResponse.json(
        { error: "主旨同內容係必填" },
        { status: 400 }
      );
    }

    const db = adminDb();

    // Gather recipients
    const recipients = new Set<string>();
    try {
      const subs = await db
        .collection("newsletterSubscribers")
        .where("isActive", "==", true)
        .get();
      subs.docs.forEach((d) => {
        const email = d.data().email;
        if (email) recipients.add(email.toLowerCase());
      });
    } catch {}
    try {
      const users = await db
        .collection("users")
        .where("isNewsletterSubscribed", "==", true)
        .get();
      users.docs.forEach((d) => {
        const email = d.data().email;
        if (email) recipients.add(email.toLowerCase());
      });
    } catch {}

    if (recipients.size === 0) {
      return NextResponse.json(
        { error: "冇任何活躍訂閱者" },
        { status: 400 }
      );
    }

    // Pull upcoming events for the footer
    const upcomingForEmail: Array<{
      id: string;
      title: string;
      dateText: string;
      category: string;
      eventType: string;
      url: string;
    }> = [];
    if (includeEvents) {
      try {
        const now = new Date();
        const eventsSnap = await db
          .collection("events")
          .where("isPublished", "==", true)
          .where("status", "==", "upcoming")
          .where("eventDate", ">=", now)
          .orderBy("eventDate", "asc")
          .limit(5)
          .get();

        eventsSnap.docs.forEach((d) => {
          const data = d.data();
          upcomingForEmail.push({
            id: d.id,
            title: data.title,
            dateText: formatEventDate(data.eventDate),
            category: categoryLabel(data.category),
            eventType: eventTypeLabel(data.eventType),
            url: `${SITE_URL}/events/${d.id}`,
          });
        });
      } catch {}
    }

    // Batch send
    const emails = Array.from(recipients);
    let sent = 0;
    let failed = 0;

    const batchSize = 20;
    const client = resend;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (to) => {
          try {
            await client.emails.send({
              from: FROM,
              to,
              subject,
              react: NewsletterEmail({
                subject,
                htmlContent: content,
                events: upcomingForEmail,
                siteUrl: SITE_URL,
              }),
            });
            sent++;
          } catch (err) {
            failed++;
            console.warn("[newsletter send]", to, err);
          }
        })
      );
    }

    return NextResponse.json({ ok: true, sent, failed, total: emails.length });
  } catch (err) {
    console.error("[POST newsletter/send]", err);
    return NextResponse.json({ error: "發送失敗" }, { status: 500 });
  }
}
