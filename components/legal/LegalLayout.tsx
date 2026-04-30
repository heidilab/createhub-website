import { ReactNode } from "react";

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  watermark: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalLayout({
  eyebrow,
  title,
  watermark,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[18vw] lg:text-[16rem] leading-none whitespace-nowrap"
          >
            {watermark}
          </h2>
        </div>
        <div className="relative container-narrow px-5 lg:px-8 py-20 lg:py-24">
          <div className="pill-tag inline-flex mb-5">{eyebrow}</div>
          <h1 className="font-serif text-[44px] sm:text-[56px] lg:text-[64px] leading-[1.05] text-brand-text mb-5">
            {title}
          </h1>
          <p className="text-[12px] text-brand-softer tracking-[0.15em] uppercase">
            最後更新：{lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="gradient-soft py-14 lg:py-20">
        <div className="container-narrow px-5 lg:px-8 max-w-3xl">
          <div className="glass-card rounded-3xl p-8 lg:p-12">
            <div className="legal-content">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
}
