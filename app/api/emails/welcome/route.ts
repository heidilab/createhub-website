import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { resend, FROM, SITE_URL } from "@/lib/resend";
import WelcomeEmail from "@/emails/WelcomeEmail";

// Called by the client right after a new user profile is created.
// The caller must prove who they are with a Firebase ID token; we only ever
// email that account's own address, and only once (welcomeEmailSentAt).
// Without this, anyone could use the endpoint to send branded mail to
// arbitrary addresses and damage the createhub.biz sending reputation.
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
      uid = (await adminAuth().verifyIdToken(idToken)).uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!resend) {
      return NextResponse.json({ ok: true, skipped: "no-resend" });
    }

    // Claim the send atomically so concurrent calls can't double-send.
    const userRef = adminDb().collection("users").doc(uid);
    const profile = await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) return null;
      const data = snap.data()!;
      if (data.welcomeEmailSentAt) return null;
      tx.update(userRef, { welcomeEmailSentAt: FieldValue.serverTimestamp() });
      return data;
    });

    if (!profile || !profile.email) {
      return NextResponse.json({ ok: true, skipped: "already-sent" });
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: profile.email,
        subject: "歡迎加入創研社 CREATE HUB！",
        react: WelcomeEmail({
          fullName: profile.fullName || "會員",
          siteUrl: SITE_URL,
          learnworldsUrl:
            process.env.NEXT_PUBLIC_LEARNWORLDS_URL ||
            "https://createhub.learnworlds.com/home",
        }),
      });
    } catch (err) {
      // Release the claim so a later call can retry.
      await userRef.update({ welcomeEmailSentAt: FieldValue.delete() });
      throw err;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/emails/welcome]", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
