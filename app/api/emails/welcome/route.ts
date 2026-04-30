import { NextResponse } from "next/server";
import { resend, FROM, SITE_URL } from "@/lib/resend";
import WelcomeEmail from "@/emails/WelcomeEmail";

export async function POST(req: Request) {
  try {
    const { email, fullName } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    if (!resend) {
      return NextResponse.json({ ok: true, skipped: "no-resend" });
    }

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "歡迎加入創研社 CREATE HUB！",
      react: WelcomeEmail({
        fullName: fullName || "會員",
        siteUrl: SITE_URL,
        learnworldsUrl:
          process.env.NEXT_PUBLIC_LEARNWORLDS_URL ||
          "https://createhub.learnworlds.com/home",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/emails/welcome]", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
