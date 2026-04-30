import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

async function assertAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin();
    const body = await req.json();
    const update: Record<string, unknown> = { updatedAt: new Date() };

    const fields = [
      "name",
      "nameEn",
      "title",
      "bio",
      "photoUrl",
      "orderIndex",
      "isVisible",
    ] as const;
    for (const f of fields) {
      if (f in body) update[f] = body[f];
    }
    if ("orderIndex" in body)
      update.orderIndex = Number(body.orderIndex) || 99;

    await adminDb().collection("teamMembers").doc(params.id).update(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH team]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin();
    await adminDb().collection("teamMembers").doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE team]", err);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}
