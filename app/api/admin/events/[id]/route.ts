import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { buildEventDoc } from "../shared";

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

    const built = buildEventDoc(body, { isCreate: false });
    if ("error" in built) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }

    const update: Record<string, unknown> = {
      ...built.data,
      updatedAt: new Date(),
    };

    if (typeof body.slug === "string" && body.slug) {
      update.slug = body.slug;
    }

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
