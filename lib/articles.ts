import { adminDb } from "@/lib/firebase/admin";
import { serializeDate } from "@/lib/serialize";
import type { Article } from "@/types";

function docToArticle(doc: FirebaseFirestore.DocumentSnapshot): Article {
  const data = doc.data()!;
  return {
    id: doc.id,
    title: data.title ?? "",
    slug: data.slug ?? doc.id,
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    coverImage: data.coverImage ?? undefined,
    author: data.author ?? "創研社編輯團隊",
    category: data.category ?? "insight",
    tags: data.tags ?? [],
    publishedAt: serializeDate(data.publishedAt) ?? undefined,
    isPublished: data.isPublished ?? false,
    createdAt: serializeDate(data.createdAt) ?? undefined,
    updatedAt: serializeDate(data.updatedAt) ?? undefined,
  };
}

export async function getPublishedArticles(
  limit?: number
): Promise<Article[]> {
  try {
    let q: FirebaseFirestore.Query = adminDb()
      .collection("articles")
      .where("isPublished", "==", true)
      .orderBy("publishedAt", "desc");
    if (limit) q = q.limit(limit);
    const snap = await q.get();
    return snap.docs.map(docToArticle);
  } catch (err) {
    console.warn("[getPublishedArticles]", err);
    return [];
  }
}

export async function getAllArticles(): Promise<Article[]> {
  try {
    const snap = await adminDb()
      .collection("articles")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map(docToArticle);
  } catch (err) {
    console.warn("[getAllArticles]", err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const snap = await adminDb()
      .collection("articles")
      .where("slug", "==", slug)
      .where("isPublished", "==", true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return docToArticle(snap.docs[0]);
  } catch {
    return null;
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const snap = await adminDb().collection("articles").doc(id).get();
    if (!snap.exists) return null;
    return docToArticle(snap);
  } catch {
    return null;
  }
}

export async function hasPublishedArticles(): Promise<boolean> {
  try {
    const snap = await adminDb()
      .collection("articles")
      .where("isPublished", "==", true)
      .limit(1)
      .get();
    return !snap.empty;
  } catch {
    return false;
  }
}

export function articleCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    insight: "商業洞察",
    news: "行業新聞",
    "case-study": "個案研究",
    tutorial: "教學專欄",
  };
  return map[cat] ?? cat;
}
