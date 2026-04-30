import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Eye, EyeOff } from "lucide-react";
import { getAllArticles, articleCategoryLabel } from "@/lib/articles";
import { toDate, formatDateOnly } from "@/lib/date";

export const dynamic = "force-dynamic";

export const metadata = { title: "商業快訊 管理" };

export default async function AdminNewsPage() {
  const articles = await getAllArticles();

  return (
    <div className="p-8 lg:p-12">
      <header className="flex items-end justify-between mb-10 pb-5 border-b border-brand-hair">
        <div>
          <div className="eyebrow-muted mb-3">News</div>
          <h1 className="font-serif text-[32px] text-brand-text">商業快訊管理</h1>
          <p className="text-[13px] text-brand-softer mt-2">
            發布商業洞察、行業新聞、個案分析
          </p>
        </div>
        <Link
          href="/admin/news/new/edit"
          className="inline-flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 text-[13px] font-bold tracking-wide hover:bg-brand-text transition"
        >
          <Plus className="w-4 h-4" />
          新增文章
        </Link>
      </header>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/admin/news/${a.id}/edit`}
              className="bg-white border border-brand-hair hover:border-brand-accent transition group"
            >
              <div className="aspect-[16/9] relative bg-brand-bg overflow-hidden">
                {a.coverImage ? (
                  <Image
                    src={a.coverImage}
                    alt={a.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-4xl text-brand-dark/20">
                      {a.title.charAt(0) || "N"}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-white/95 text-[10px] font-semibold text-brand-dark px-2 py-[2px]">
                    {articleCategoryLabel(a.category)}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  {a.isPublished ? (
                    <span className="bg-brand-accent/95 text-white text-[10px] font-semibold px-2 py-[2px] inline-flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" /> 已發布
                    </span>
                  ) : (
                    <span className="bg-brand-softer/90 text-white text-[10px] font-semibold px-2 py-[2px] inline-flex items-center gap-1">
                      <EyeOff className="w-2.5 h-2.5" /> 草稿
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="font-serif text-[17px] text-brand-text line-clamp-2 leading-snug mb-2">
                  {a.title || "（未命名文章）"}
                </div>
                <div className="text-[11px] text-brand-softer mb-3">
                  {a.publishedAt
                    ? formatDateOnly(toDate(a.publishedAt) ?? a.publishedAt)
                    : "未發布"}
                  {a.author ? ` · ${a.author}` : ""}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-brand-accent font-semibold">
                  <Edit2 className="w-3 h-3" /> 編輯
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-brand-rule p-16 text-center">
          <div className="eyebrow-muted mb-3">No Articles Yet</div>
          <div className="rule-accent mx-auto mb-5" />
          <h2 className="font-serif text-[24px] text-brand-text mb-3">
            未有任何文章
          </h2>
          <p className="text-[13px] text-brand-softer mb-6 max-w-md mx-auto">
            建立第一篇商業快訊。當發布第一篇文章，「商業快訊」頁面會自動喺網站顯示。
          </p>
          <Link href="/admin/news/new/edit" className="btn-primary">
            <Plus className="w-4 h-4" />
            撰寫第一篇文章
          </Link>
        </div>
      )}
    </div>
  );
}
