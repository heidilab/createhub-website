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
    if (!body.title || !body.excerpt || !body.content) {
      return NextResponse.json(
        { error: "標題、摘要、正文都係必填" },
        { status: 400 }
      );
    }

    const data = {
      title: body.title,
      slug: body.slug || slugify(body.title),
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage || null,
      author: body.author || "創研社編輯團隊",
      category: body.category || "insight",
      tags: Array.isArray(body.tags) ? body.tags : [],
      publishedAt: body.publishedAt
        ? new Date(body.publishedAt)
        : body.isPublished
        ? new Date()
        : null,
      isPublished: !!body.isPublished,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ref = await adminDb().collection("articles").add(data);
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("[POST articles]", err);
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}
