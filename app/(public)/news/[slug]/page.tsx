import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getArticleBySlug, articleCategoryLabel } from "@/lib/articles";
import { renderMarkdown } from "@/lib/markdown";
import { formatDateOnly, toDate } from "@/lib/date";
import JsonLd from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "文章不存在" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: article.coverImage ? [{ url: article.coverImage }] : [],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const html = renderMarkdown(article.content);

  const schema = articleJsonLd({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    author: article.author,
    publishedAtIso: toDate(article.publishedAt)?.toISOString(),
    updatedAtIso: toDate(article.updatedAt)?.toISOString(),
    coverImage: article.coverImage,
  });

  return (
    <>
      <JsonLd data={schema} />
      {/* Cover */}
      {article.coverImage && (
        <div className="relative w-full aspect-[21/9] bg-brand-dark">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}

      <div className="gradient-soft pt-6 pb-2">
        <div className="container-narrow px-5 lg:px-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-dark"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回商業快訊
          </Link>
        </div>
      </div>

      <div className="gradient-soft pb-16">
        <article className="container-narrow px-5 lg:px-8 py-8 lg:py-12 max-w-3xl">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="pill-tag-accent">
              {articleCategoryLabel(article.category)}
            </span>
            {article.tags?.map((t) => (
              <span key={t} className="pill-tag">
                {t}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-serif text-[36px] sm:text-[44px] lg:text-[56px] leading-[1.1] text-brand-text mb-6">
            {article.title}
          </h1>

          {/* Byline */}
          <div className="flex items-center gap-3 text-[13px] text-brand-softer mb-10 pb-8 border-b border-brand-hair">
            <span className="text-brand-muted font-medium">{article.author}</span>
            <span>·</span>
            <span>
              {article.publishedAt
                ? formatDateOnly(
                    toDate(article.publishedAt) ?? article.publishedAt
                  )
                : ""}
            </span>
          </div>

          {/* Excerpt — lead */}
          <div className="glass-card rounded-3xl p-7 lg:p-9 mb-10">
            <p className="font-serif italic text-[18px] lg:text-[20px] text-brand-muted leading-[1.85]">
              {article.excerpt}
            </p>
          </div>

          {/* Body */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Footer */}
          <div className="mt-16 pt-10 border-t border-brand-hair text-center">
            <div className="pill-tag inline-flex mb-5">Share This</div>
            <p className="text-[13px] text-brand-softer mb-6">
              覺得有用？歡迎分享畀你嘅朋友或同事。
            </p>
            <Link href="/news" className="pill-btn-outline">
              <ArrowLeft className="w-3.5 h-3.5" />
              查看更多商業快訊
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
