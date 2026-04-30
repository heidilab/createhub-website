import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM, SITE_URL } from "@/lib/resend";
import EventConfirmationEmail from "@/emails/EventConfirmationEmail";
import { formatEventDate } from "@/lib/date";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("[Stripe webhook signature]", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutFailed(session);
        break;
      }
      default:
        // ignore
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe webhook handler]", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const regId =
    session.client_reference_id ||
    (session.metadata?.registrationId as string | undefined);
  if (!regId) {
    console.warn("[webhook] Missing registrationId");
    return;
  }

  const db = adminDb();
  const regRef = db.collection("registrations").doc(regId);
  const regSnap = await regRef.get();
  if (!regSnap.exists) {
    console.warn("[webhook] Registration not found:", regId);
    return;
  }
  const reg = regSnap.data()!;

  // Idempotency: skip if already marked paid
  if (reg.paymentStatus === "paid") return;

  await regRef.update({
    paymentStatus: "paid",
    status: "confirmed",
    stripePaymentIntentId: session.payment_intent,
    stripeAmountTotal: session.amount_total,
    stripeCurrency: session.currency,
    paidAt: new Date(),
  });

  // Fetch event to render confirmation email
  const eventSnap = await db.collection("events").doc(reg.eventId).get();
  const event = eventSnap.data();
  if (!event) return;

  if (resend && reg.userEmail) {
    try {
      await resend.emails.send({
        from: FROM,
        to: reg.userEmail,
        subject: `【報名確認 — 已付款】${event.title}`,
        react: EventConfirmationEmail({
          fullName: reg.userName || reg.userEmail,
          eventTitle: event.title,
          eventDateText: formatEventDate(event.eventDate),
          location: event.location,
          isOnline: event.eventType === "online",
          zoomLink: event.zoomLink,
          speakerName: event.speakerName,
          eventUrl: `${SITE_URL}/events/${reg.eventId}`,
        }),
      });
    } catch (err) {
      console.warn("[webhook] email send failed:", err);
    }
  }
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const regId =
    session.client_reference_id ||
    (session.metadata?.registrationId as string | undefined);
  if (!regId) return;

  const db = adminDb();
  const regRef = db.collection("registrations").doc(regId);
  const regSnap = await regRef.get();
  if (!regSnap.exists) return;
  const reg = regSnap.data()!;
  if (reg.paymentStatus === "paid") return;

  await regRef.update({
    paymentStatus: "pending",
    status: "cancelled",
    paymentFailedAt: new Date(),
  });
}
