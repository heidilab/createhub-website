import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const db = adminDb();

    const data = {
      title: body.title,
      slug: body.slug || slugify(body.title),
      description: body.description ?? "",
      coverImage: body.coverImage || null,
      eventType: body.eventType,
      category: body.category,
      speakerName: body.speakerName || null,
      speakerBio: body.speakerBio || null,
      eventDate: new Date(body.eventDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location || null,
      zoomLink: body.zoomLink || null,
      isFree: !!body.isFree,
      priceHkd: Number(body.priceHkd) || 0,
      capacity: body.capacity ? Number(body.capacity) : null,
      status: body.status || "upcoming",
      isPublished: !!body.isPublished,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!data.title || !data.eventDate || !data.eventType || !data.category) {
      return NextResponse.json(
        { error: "請填寫所有必填欄位" },
        { status: 400 }
      );
    }

    const ref = await db.collection("events").add(data);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("[POST /api/admin/events]", err);
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}
