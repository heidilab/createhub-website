import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.title) {
      return NextResponse.json(
        { error: "請填寫姓名同職銜" },
        { status: 400 }
      );
    }

    const data = {
      name: body.name,
      nameEn: body.nameEn || null,
      title: body.title,
      bio: body.bio || null,
      photoUrl: body.photoUrl || null,
      orderIndex: Number(body.orderIndex) || 99,
      isVisible: body.isVisible !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ref = await adminDb().collection("teamMembers").add(data);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("[POST team]", err);
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}
