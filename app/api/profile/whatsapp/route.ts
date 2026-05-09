import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { whatsapp } = await req.json();
    if (typeof whatsapp !== "string") {
      return NextResponse.json(
        { error: "請填寫 WhatsApp 號碼" },
        { status: 400 }
      );
    }
    const trimmed = whatsapp.trim();
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 8) {
      return NextResponse.json(
        { error: "請填寫有效嘅 WhatsApp 號碼（至少 8 位數字）" },
        { status: 400 }
      );
    }

    await adminDb()
      .collection("users")
      .doc(user.uid)
      .set({ whatsapp: trimmed }, { merge: true });

    return NextResponse.json({ ok: true, whatsapp: trimmed });
  } catch (err) {
    console.error("[POST /api/profile/whatsapp]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
