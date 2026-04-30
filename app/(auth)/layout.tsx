import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen pt-[5px] gradient-soft">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left — form */}
        <div className="flex flex-col px-6 sm:px-10 lg:px-14 py-10">
          <Link href="/" className="inline-block" aria-label="創研社 CREATE HUB 首頁">
            <Image
              src="/logo.png"
              alt="創研社 CREATE HUB"
              width={1280}
              height={1024}
              priority
              className="h-[56px] w-auto"
            />
          </Link>
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-md glass-card rounded-3xl p-8 lg:p-10">
              {children}
            </div>
          </div>
          <div className="text-[11px] text-brand-softer tracking-wide">
            © {new Date().getFullYear()} CREATE HUB. All rights reserved.
          </div>
        </div>

        {/* Right — editorial */}
        <div className="hidden lg:flex bg-brand-dark relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, #34ccef 0%, transparent 50%), radial-gradient(circle at 70% 70%, #a8eaf7 0%, transparent 50%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2
              aria-hidden="true"
              className="font-outfit font-black uppercase text-[14rem] leading-none whitespace-nowrap"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px rgba(168, 234, 247, 0.06)",
              }}
            >
              CREATE&nbsp;HUB
            </h2>
          </div>
          <div className="relative z-10 flex flex-col justify-between px-14 py-16 w-full text-white">
            <div>
              <div
                className="pill-tag-accent inline-flex mb-6"
                style={{ background: "rgba(52, 204, 239, 0.15)", color: "#a8eaf7" }}
              >
                Hong Kong Business Education
              </div>
              <h2 className="font-serif text-[44px] xl:text-[60px] leading-[1.05] text-white">
                學以致用
                <br />
                <span className="italic font-semibold text-brand-accent">
                  創出未來
                </span>
              </h2>
            </div>
            <blockquote className="font-serif text-[18px] italic leading-[1.65] text-white/85 max-w-md">
              &ldquo;真正的商業教育，
              <br />
              係將經驗轉化為下一代的養份。&rdquo;
              <div className="mt-5 text-[11px] not-italic tracking-[0.2em] uppercase text-brand-accent font-sans font-semibold">
                — Create Hub Founders
              </div>
            </blockquote>
          </div>
        </div>
      </div>
    </main>
  );
}
