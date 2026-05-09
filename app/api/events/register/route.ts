import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { SITE_URL } from "@/lib/resend";
import { stripe, isStripeConfigured, CURRENCY } from "@/lib/stripe";
import { sendRegistrationEmails } from "@/lib/event-notifications";

interface SessionShape {
  id: string;
  startDate?: unknown;
  endDate?: unknown;
  location?: string | null;
  zoomLink?: string | null;
  capacity?: number | null;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { eventId, sessionId: rawSessionId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Event ID 缺失" }, { status: 400 });
    }

    const db = adminDb();

    const eventSnap = await db.collection("events").doc(eventId).get();
    if (!eventSnap.exists) {
      return NextResponse.json({ error: "活動不存在" }, { status: 404 });
    }
    const event = eventSnap.data()!;
    if (!event.isPublished) {
      return NextResponse.json({ error: "活動未公開" }, { status: 400 });
    }

    // ── Resolve session ────────────────────────────────────────
    const sessions: SessionShape[] = Array.isArray(event.sessions)
      ? event.sessions
      : [];

    let session: SessionShape | undefined;
    if (sessions.length > 0) {
      // New schema events
      const wantedId = rawSessionId || sessions[0].id;
      session = sessions.find((s) => s.id === wantedId);
      if (!session) {
        return NextResponse.json(
          { error: "場次不存在，請重新選擇" },
          { status: 400 }
        );
      }
    } else {
      // Back-compat: legacy event without sessions array
      session = {
        id: "default",
        startDate: event.eventDate,
        endDate: event.endDate,
        location: event.location ?? null,
        zoomLink: event.zoomLink ?? null,
        capacity: typeof event.capacity === "number" ? event.capacity : null,
      };
    }
    const sessionId = session.id;

    // ── Duplicate check (per session) ──────────────────────────
    const dupSnap = await db
      .collection("registrations")
      .where("userId", "==", user.uid)
      .where("eventId", "==", eventId)
      .where("sessionId", "==", sessionId)
      .where("paymentStatus", "in", ["paid", "free"])
      .limit(1)
      .get();
    if (!dupSnap.empty) {
      return NextResponse.json(
        { error: "你已經報名呢個場次" },
        { status: 409 }
      );
    }

    // Cancel any previous PENDING registration for the same user+session
    const pendingPrior = await db
      .collection("registrations")
      .where("userId", "==", user.uid)
      .where("eventId", "==", eventId)
      .where("sessionId", "==", sessionId)
      .where("paymentStatus", "==", "pending")
      .get();
    await Promise.all(
      pendingPrior.docs.map((d) =>
        d.ref.update({ status: "cancelled", cancelledAt: new Date() })
      )
    );

    // ── Capacity check (per session) ───────────────────────────
    if (typeof session.capacity === "number" && session.capacity > 0) {
      const countSnap = await db
        .collection("registrations")
        .where("eventId", "==", eventId)
        .where("sessionId", "==", sessionId)
        .where("paymentStatus", "in", ["paid", "free"])
        .count()
        .get();
      if (countSnap.data().count >= session.capacity) {
        return NextResponse.json(
          { error: "呢個場次已滿額，請揀其他場次或稍後再試" },
          { status: 409 }
        );
      }
    }

    // ── Branch: FREE event ─────────────────────────────────────
    if (event.isFree || !event.priceHkd) {
      const registration = {
        eventId,
        sessionId,
        userId: user.uid,
        userEmail: user.email,
        userName: user.fullName,
        status: "confirmed",
        ticketType: "standard",
        paymentStatus: "free",
        registeredAt: new Date(),
      };
      const ref = await db.collection("registrations").add(registration);

      // Fire notification emails (attendee + admin + speakers)
      // Look up the user's whatsapp from profile for the notification email
      let whatsapp: string | undefined;
      try {
        const userSnap = await db.collection("users").doc(user.uid).get();
        whatsapp = userSnap.data()?.whatsapp;
      } catch {
        // ignore
      }

      await sendRegistrationEmails({
        eventId,
        sessionId,
        attendee: {
          email: user.email,
          name: user.fullName,
          whatsapp,
        },
      });

      return NextResponse.json({
        ok: true,
        mode: "free",
        registrationId: ref.id,
      });
    }

    // ── Branch: PAID event → Stripe Checkout ───────────────────
    if (!isStripeConfigured || !stripe) {
      return NextResponse.json(
        {
          error: "付款系統未設定。請聯絡 info@createhub.biz 或稍後再試。",
        },
        { status: 503 }
      );
    }

    // Create pending registration first (webhook updates it on payment success)
    const pendingReg = {
      eventId,
      sessionId,
      userId: user.uid,
      userEmail: user.email,
      userName: user.fullName,
      status: "confirmed",
      ticketType: "standard",
      paymentStatus: "pending",
      registeredAt: new Date(),
    };
    const regRef = await db.collection("registrations").add(pendingReg);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_options: {
        wechat_pay: { client: "web" },
      },
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            unit_amount: Math.round(Number(event.priceHkd) * 100),
            product_data: {
              name: event.title,
              ...(event.coverImage ? { images: [event.coverImage] } : {}),
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      client_reference_id: regRef.id,
      metadata: {
        registrationId: regRef.id,
        eventId,
        sessionId,
        userId: user.uid,
      },
      success_url: `${SITE_URL}/events/${eventId}/success?reg={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/events/${eventId}?payment=cancelled`,
      locale: "zh-HK",
    });

    await regRef.update({ stripeCheckoutSessionId: checkoutSession.id });

    return NextResponse.json({
      ok: true,
      mode: "paid",
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (err) {
    console.error("[POST /api/events/register]", err);
    return NextResponse.json(
      { error: "報名失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
