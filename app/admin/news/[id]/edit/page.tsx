import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/articles";
import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "編輯文章" };

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "new";
  const article = isNew ? null : await getArticleById(params.id);
  if (!isNew && !article) notFound();

  return (
    <div className="p-8 lg:p-12 max-w-3xl">
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-dark mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        返回文章列表
      </Link>
      <header className="mb-10 pb-5 border-b border-brand-hair">
        <div className="eyebrow-muted mb-3">
          {isNew ? "New Article" : "Edit Article"}
        </div>
        <h1 className="font-serif text-[32px] text-brand-text">
          {isNew ? "新增文章" : "編輯文章"}
        </h1>
      </header>
      <ArticleForm mode={isNew ? "create" : "edit"} initial={article ?? undefined} />
    </div>
  );
}
