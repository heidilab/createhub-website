import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM, SITE_URL } from "@/lib/resend";
import { stripe, isStripeConfigured, CURRENCY } from "@/lib/stripe";
import EventConfirmationEmail from "@/emails/EventConfirmationEmail";
import { formatEventDate } from "@/lib/date";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { eventId } = await req.json();
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

    // Duplicate check (only blocks PAID or FREE-confirmed registrations)
    const paidExisting = await db
      .collection("registrations")
      .where("userId", "==", user.uid)
      .where("eventId", "==", eventId)
      .where("paymentStatus", "in", ["paid", "free"])
      .limit(1)
      .get();
    if (!paidExisting.empty) {
      return NextResponse.json(
        { error: "你已經報名此活動" },
        { status: 409 }
      );
    }

    // Cancel any previous pending registrations for this user+event
    const pendingPrior = await db
      .collection("registrations")
      .where("userId", "==", user.uid)
      .where("eventId", "==", eventId)
      .where("paymentStatus", "==", "pending")
      .get();
    await Promise.all(
      pendingPrior.docs.map((d) =>
        d.ref.update({ status: "cancelled", cancelledAt: new Date() })
      )
    );

    // Capacity check — count only paid/free registrations
    if (event.capacity) {
      const paidCount = (
        await db
          .collection("registrations")
          .where("eventId", "==", eventId)
          .where("paymentStatus", "in", ["paid", "free"])
          .count()
          .get()
      ).data().count;
      if (paidCount >= event.capacity) {
        return NextResponse.json({ error: "活動已滿額" }, { status: 409 });
      }
    }

    // ══════ Branch: FREE event ══════
    if (event.isFree || !event.priceHkd) {
      const registration = {
        eventId,
        userId: user.uid,
        userEmail: user.email,
        userName: user.fullName,
        status: "confirmed",
        ticketType: "standard",
        paymentStatus: "free",
        registeredAt: new Date(),
      };
      const ref = await db.collection("registrations").add(registration);

      if (resend) {
        try {
          await resend.emails.send({
            from: FROM,
            to: user.email,
            subject: `【報名確認】${event.title} — 創研社 CREATE HUB`,
            react: EventConfirmationEmail({
              fullName: user.fullName || user.email,
              eventTitle: event.title,
              eventDateText: formatEventDate(event.eventDate),
              location: event.location,
              isOnline: event.eventType === "online",
              zoomLink: event.zoomLink,
              speakerName: event.speakerName,
              eventUrl: `${SITE_URL}/events/${eventId}`,
            }),
          });
        } catch (err) {
          console.warn("[register] email failed:", err);
        }
      }
      return NextResponse.json({ ok: true, mode: "free", registrationId: ref.id });
    }

    // ══════ Branch: PAID event → Stripe Checkout ══════
    if (!isStripeConfigured || !stripe) {
      return NextResponse.json(
        {
          error:
            "付款系統未設定。請聯絡 info@createhub.biz 或稍後再試。",
        },
        { status: 503 }
      );
    }

    // Create pending registration first (so webhook can find it via metadata)
    const pendingReg = {
      eventId,
      userId: user.uid,
      userEmail: user.email,
      userName: user.fullName,
      status: "confirmed", // placeholder; webhook will keep it as confirmed after payment
      ticketType: "standard",
      paymentStatus: "pending",
      registeredAt: new Date(),
    };
    const regRef = await db.collection("registrations").add(pendingReg);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // No payment_method_types — Stripe auto-uses whatever is enabled in dashboard
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
              description: event.speakerName
                ? `講師：${event.speakerName}`
                : undefined,
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
        userId: user.uid,
      },
      success_url: `${SITE_URL}/events/${eventId}/success?reg={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/events/${eventId}?payment=cancelled`,
      locale: "zh-HK",
    });

    // Save session id on registration for cross-reference
    await regRef.update({ stripeCheckoutSessionId: session.id });

    return NextResponse.json({
      ok: true,
      mode: "paid",
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("[POST /api/events/register]", err);
    return NextResponse.json(
      { error: "報名失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
