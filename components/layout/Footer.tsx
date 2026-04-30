import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { SITE, NAV_LINKS } from "@/lib/constants";

export default function Footer({ hasNews = false }: { hasNews?: boolean }) {
  const visibleLinks = NAV_LINKS.filter((l) =>
    l.conditional === "hasNews" ? hasNews : true
  );
  return (
    <footer className="bg-brand-dark text-white border-t border-brand-accent/20">
      {/* Main */}
      <div className="container-edge px-5 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="bg-white inline-block p-4 rounded-sm">
            <Image
              src="/logo.png"
              alt="創研社 CREATE HUB"
              width={1280}
              height={1024}
              className="h-[110px] w-auto"
            />
          </div>
          <p className="text-[13px] text-white/70 leading-[1.85] mt-5 max-w-md">
            集合豐富營商經驗的老闆及專業團隊，通過線上課程及線下活動，助你掌握商業新知識，開拓無限可能。
          </p>
          <div className="flex items-center gap-4 mt-6">
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white/60 hover:text-brand-accent transition"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/60 hover:text-brand-accent transition"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={SITE.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-white/60 hover:text-brand-accent transition"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="text-[11px] text-brand-accent tracking-[0.25em] uppercase font-semibold mb-4">
            網站導覽
          </div>
          <ul className="space-y-2.5 text-[13px] text-white/70">
            {visibleLinks.map((link) =>
              link.external ? (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-accent transition"
                  >
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-accent transition"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="text-[11px] text-brand-accent tracking-[0.25em] uppercase font-semibold mb-4">
            聯絡我們
          </div>
          <ul className="space-y-2.5 text-[13px] text-white/70">
            <li>
              <a href={`tel:${SITE.phone}`} className="hover:text-brand-accent">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="hover:text-brand-accent"
              >
                {SITE.email}
              </a>
            </li>
            <li className="text-white/60">{SITE.address}</li>
          </ul>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-white/10">
        <div className="container-edge px-5 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] tracking-wide">
          <span className="text-white/50">
            © {new Date().getFullYear()} CREATE HUB. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-white/50 hover:text-brand-accent">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/50 hover:text-brand-accent">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
