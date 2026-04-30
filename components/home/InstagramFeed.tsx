import Script from "next/script";
import { Instagram, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/constants";

const LIGHTWIDGET_ID = "5cb81e9aac15570893e9e70e80fede6c";

export default function InstagramFeed() {
  return (
    <section className="relative py-20 lg:py-24 bg-gradient-to-br from-[#feda75]/8 via-[#fa7e1e]/6 to-[#d62976]/8 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h2
          aria-hidden="true"
          className="watermark-text text-[16vw] lg:text-[14rem] leading-none whitespace-nowrap"
        >
          INSTAGRAM
        </h2>
      </div>

      <div className="relative container-wide px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976] flex items-center justify-center flex-shrink-0 shadow-lg">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="pill-tag mb-3">@createhub.hk</div>
              <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[48px] text-brand-text leading-tight">
                Follow us on{" "}
                <em className="not-italic font-semibold text-brand-dark italic">
                  Instagram
                </em>
              </h2>
            </div>
          </div>

          <a
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn-primary self-start"
          >
            <Instagram className="w-3.5 h-3.5" />
            FOLLOW US
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Widget */}
        <div className="glass-card rounded-3xl p-3 sm:p-5 overflow-hidden">
          <iframe
            src={`https://cdn.lightwidget.com/widgets/${LIGHTWIDGET_ID}.html`}
            scrolling="no"
            className="lightwidget-widget w-full border-0 overflow-hidden rounded-2xl"
            style={{ minHeight: "400px" }}
            title="@createhub.hk Instagram feed"
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>

      {/* LightWidget auto-resize script */}
      <Script
        src="https://cdn.lightwidget.com/widgets/lightwidget.js"
        strategy="lazyOnload"
      />
    </section>
  );
}
