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
      "title",
      "slug",
      "excerpt",
      "content",
      "coverImage",
      "author",
      "category",
      "tags",
      "isPublished",
    ] as const;
    for (const f of fields) if (f in body) update[f] = body[f];

    if ("publishedAt" in body) {
      update.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    } else if (body.isPublished) {
      // If toggling to published without explicit date, set publishedAt now
      const snap = await adminDb()
        .collection("articles")
        .doc(params.id)
        .get();
      if (snap.exists && !snap.data()?.publishedAt) {
        update.publishedAt = new Date();
      }
    }

    await adminDb().collection("articles").doc(params.id).update(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH article]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin();
    await adminDb().collection("articles").doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE article]", err);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}
