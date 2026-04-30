import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM, ADMIN_EMAIL } from "@/lib/resend";
import ContactNotificationEmail from "@/emails/ContactNotificationEmail";

interface Body {
  name: string;
  email: string;
  whatsapp?: string;
  category: "course" | "event" | "other";
  message: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Body>;

    if (!body.name || !body.email || !body.message || !body.category) {
      return NextResponse.json(
        { error: "請填寫所有必填欄位" },
        { status: 400 }
      );
    }

    const doc = {
      name: String(body.name).slice(0, 200),
      email: String(body.email).slice(0, 200),
      whatsapp: body.whatsapp ? String(body.whatsapp).slice(0, 50) : "",
      category: body.category,
      message: String(body.message).slice(0, 5000),
      isRead: false,
      createdAt: new Date(),
    };

    await adminDb().collection("contactInquiries").add(doc);

    if (resend) {
      try {
        await resend.emails.send({
          from: FROM,
          to: ADMIN_EMAIL,
          replyTo: doc.email,
          subject: `[聯絡表單] ${doc.name} — ${
            { course: "課程查詢", event: "活動查詢", other: "其他" }[doc.category]
          }`,
          react: ContactNotificationEmail(doc),
        });
      } catch (err) {
        console.warn("[contact] email notification failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json({ error: "發送失敗，請稍後再試" }, { status: 500 });
  }
}
