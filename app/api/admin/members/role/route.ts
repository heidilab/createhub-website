import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  const caller = await getSessionUser();
  if (!caller || caller.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { uid, role } = await req.json();
    if (!uid || !["member", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (uid === caller.uid && role !== "admin") {
      return NextResponse.json(
        { error: "唔可以降級自己嘅 admin 權限" },
        { status: 400 }
      );
    }

    await adminDb().collection("users").doc(uid).update({ role });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST members/role]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
