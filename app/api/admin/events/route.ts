import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { slugify } from "@/lib/utils";
import { buildEventDoc } from "./shared";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const db = adminDb();

    const built = buildEventDoc(body, { isCreate: true });
    if ("error" in built) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }

    if (!body.title) {
      return NextResponse.json(
        { error: "請填寫所有必填欄位" },
        { status: 400 }
      );
    }

    const data = {
      ...built.data,
      slug: body.slug || slugify(body.title),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ref = await db.collection("events").add(data);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("[POST /api/admin/events]", err);
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}
