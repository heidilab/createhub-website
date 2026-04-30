import Link from "next/link";
import { ArrowRight, Users, Sparkles, Target, Eye } from "lucide-react";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import { getVisibleTeamMembers } from "@/lib/team";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "關於我們",
  description:
    "創研社（CREATE HUB）集合豐富營商經驗的老闆及專業團隊，通過線上課程及線下活動，提供實用、貼地的商業學習體驗。",
};

export default async function AboutPage() {
  const team = await getVisibleTeamMembers();

  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[18vw] lg:text-[18rem] leading-none whitespace-nowrap"
          >
            ABOUT
          </h2>
        </div>
        <div className="relative container-wide px-5 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="pill-tag mb-6">
              <Users className="w-3 h-3 mr-1.5 text-brand-accent" />
              About Us
            </div>
            <h1 className="font-serif text-[48px] sm:text-[64px] lg:text-[80px] leading-[1.0] text-brand-text mb-7">
              關於創研社
            </h1>
            <p className="text-[15px] lg:text-[17px] text-brand-muted leading-[1.95] max-w-3xl">
              創研社（CREATE HUB）是一個集合了豐富營商經驗的老闆及專業團隊的教育平台。我們致力通過線上課程及線下活動，為有志提升商業知識的人士提供實用、貼地的學習體驗，助您掌握市場趨勢，創出屬於自己的成功故事。
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision — glass cards */}
      <section className="gradient-soft py-20 lg:py-24">
        <div className="container-wide px-5 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-10 relative">
              <div
                className="absolute -top-3 -left-3"
                style={{ transform: "rotate(-3deg)" }}
              >
                <span className="pill-tag-accent">
                  <Target className="w-3 h-3 mr-1.5" />
                  Mission
                </span>
              </div>
              <h2 className="font-serif text-[32px] lg:text-[40px] text-brand-dark leading-tight mb-5 mt-3">
                使命
              </h2>
              <p className="text-[15px] text-brand-muted leading-[2]">
                提供高質素的商業教育，讓每一個人都能夠不斷學習、持續成長。
              </p>
            </div>

            <div className="glass-card rounded-3xl p-10 relative">
              <div
                className="absolute -top-3 -left-3"
                style={{ transform: "rotate(2deg)" }}
              >
                <span className="pill-tag-dark">
                  <Eye className="w-3 h-3 mr-1.5" />
                  Vision
                </span>
              </div>
              <h2 className="font-serif text-[32px] lg:text-[40px] text-brand-dark leading-tight mb-5 mt-3">
                願景
              </h2>
              <p className="text-[15px] text-brand-muted leading-[2]">
                成為香港最具影響力的商業教育平台，培育下一代創業家及企業領袖。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none overflow-hidden pt-20">
          <h3
            aria-hidden="true"
            className="watermark-text text-[14vw] lg:text-[12rem] leading-none whitespace-nowrap"
          >
            FOUNDERS
          </h3>
        </div>

        <div className="relative container-wide px-5 lg:px-8">
          <div className="text-center mb-14 lg:mb-20">
            <div className="pill-tag inline-flex mb-5">
              <Sparkles className="w-3 h-3 mr-1.5 text-brand-accent" />
              Our Founders
            </div>
            <h2 className="font-serif text-[36px] sm:text-[44px] lg:text-[56px] text-brand-text leading-tight mb-5">
              認識創研社團隊
            </h2>
            <p className="text-[14px] lg:text-[15px] text-brand-muted leading-[1.95] max-w-2xl mx-auto">
              四位共同創辦人橫跨國際貿易、工商管理、活動策劃與財務會計領域，帶來真實商業實戰經驗。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {team.map((m) => (
              <TeamMemberCard key={m.id} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 lg:py-24 bg-brand-dark text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, #34ccef 0%, transparent 50%)",
          }}
        />
        <div className="relative container-narrow px-5 text-center">
          <div
            className="pill-tag-accent inline-flex mb-6"
            style={{ background: "rgba(52, 204, 239, 0.15)", color: "#a8eaf7" }}
          >
            Join Us
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] text-white leading-tight mb-5">
            與我哋一齊成長
          </h2>
          <p className="text-[14px] lg:text-[15px] text-white/75 max-w-xl mx-auto mb-10 leading-relaxed">
            無論你係創業家、企業管理人定係對商業有興趣嘅學習者，創研社都歡迎你嘅加入。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link href="/register" className="pill-btn-accent">
              立即加入
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/events" className="pill-btn-outline" style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
              查看活動
            </Link>
            <a
              href={SITE.learnworldsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-outline"
              style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            >
              探索課程
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
