import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getPublishedArticles, articleCategoryLabel } from "@/lib/articles";
import { formatDateOnly, toDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "商業快訊",
  description: "創研社商業洞察、行業新聞、個案研究、教學專欄，助你掌握市場趨勢。",
};

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  // Per user spec: hide the page until first article is published
  if (articles.length === 0) {
    redirect("/");
  }

  const [featured, ...rest] = articles;

  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[18vw] lg:text-[16rem] leading-none whitespace-nowrap"
          >
            INSIGHTS
          </h2>
        </div>
        <div className="relative container-wide px-5 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="pill-tag mb-6">Business Insights</div>
            <h1 className="font-serif text-[48px] sm:text-[64px] lg:text-[80px] leading-[1.0] text-brand-text mb-6">
              商業快訊
            </h1>
            <p className="text-[15px] lg:text-[17px] text-brand-muted leading-[1.95] max-w-2xl">
              由創研社團隊精選嘅商業洞察、行業新聞及個案分析，助你掌握最新市場動態。
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="section-divider bg-white">
          <Link
            href={`/news/${featured.slug}`}
            className="block container-wide px-5 lg:px-8 py-14 lg:py-20 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative aspect-[16/10] bg-brand-bg overflow-hidden order-2 lg:order-1">
                {featured.coverImage ? (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-6xl text-brand-dark/15">
                      創 研 社
                    </span>
                  </div>
                )}
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="tag-type">
                    {articleCategoryLabel(featured.category)}
                  </span>
                  <span className="text-[11px] text-brand-softer tracking-[0.15em] uppercase">
                    Featured
                  </span>
                </div>
                <h2 className="font-serif text-[30px] lg:text-[42px] text-brand-text leading-[1.15] mb-5 group-hover:text-brand-accent transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[14px] lg:text-[15px] text-brand-muted leading-[1.9] mb-6">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3 text-[12px] text-brand-softer mb-6">
                  <span>{featured.author}</span>
                  <span>·</span>
                  <span>
                    {featured.publishedAt
                      ? formatDateOnly(
                          toDate(featured.publishedAt) ?? featured.publishedAt
                        )
                      : ""}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-accent border-b border-brand-accent pb-[1px] group-hover:gap-2 transition-all">
                  閱讀全文 <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Article grid */}
      {rest.length > 0 && (
        <section className="container-wide px-5 lg:px-8 py-12 lg:py-16">
          <div className="eyebrow-muted mb-4">More Articles</div>
          <div className="rule-accent mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {rest.map((a) => (
              <Link
                key={a.id}
                href={`/news/${a.slug}`}
                className="group flex flex-col bg-white border border-brand-hair hover:border-brand-accent transition"
              >
                <div className="aspect-[16/10] relative bg-brand-bg overflow-hidden">
                  {a.coverImage ? (
                    <Image
                      src={a.coverImage}
                      alt={a.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-serif text-5xl text-brand-dark/15">
                        {a.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <span className="tag-type">
                      {articleCategoryLabel(a.category)}
                    </span>
                  </div>
                  <h3 className="font-serif text-[20px] text-brand-text leading-snug mb-3 line-clamp-2 group-hover:text-brand-accent transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-[13px] text-brand-softer leading-relaxed line-clamp-3 mb-4">
                    {a.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-brand-hair flex items-center justify-between text-[11px] text-brand-softer">
                    <span>{a.author}</span>
                    <span>
                      {a.publishedAt
                        ? formatDateOnly(toDate(a.publishedAt) ?? a.publishedAt)
                        : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
