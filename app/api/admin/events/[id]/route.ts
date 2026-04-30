import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

async function assertAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin();
    const body = await req.json();
    const update: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    const fields = [
      "title",
      "slug",
      "description",
      "coverImage",
      "eventType",
      "category",
      "speakerName",
      "speakerBio",
      "location",
      "zoomLink",
      "isFree",
      "priceHkd",
      "capacity",
      "status",
      "isPublished",
    ] as const;

    for (const f of fields) {
      if (f in body) update[f] = body[f];
    }
    if (body.eventDate) update.eventDate = new Date(body.eventDate);
    if (body.endDate) update.endDate = new Date(body.endDate);
    else if ("endDate" in body) update.endDate = null;
    if ("capacity" in body)
      update.capacity = body.capacity ? Number(body.capacity) : null;
    if ("priceHkd" in body) update.priceHkd = Number(body.priceHkd) || 0;

    await adminDb().collection("events").doc(params.id).update(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH event]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin();
    await adminDb().collection("events").doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE event]", err);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}
