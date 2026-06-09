"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCircle,
  Mail,
  Newspaper,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "總覽", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "活動管理", icon: CalendarDays },
  { href: "/admin/news", label: "商業快訊", icon: Newspaper },
  { href: "/admin/team", label: "團隊管理", icon: UserCircle },
  { href: "/admin/members", label: "會員管理", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const currentLink = [...LINKS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((l) =>
      l.exact ? pathname === l.href : pathname.startsWith(l.href)
    );

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-brand-dark text-white px-4 h-14 border-b border-white/10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 text-white hover:bg-white/10 rounded"
          aria-label="開啟選單"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-brand-accent tracking-[0.2em] uppercase font-semibold leading-none">
            Admin
          </div>
          <div className="text-[14px] font-semibold truncate leading-tight mt-0.5">
            {currentLink?.label ?? "管理後台"}
          </div>
        </div>
        <Link href="/admin" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="CREATE HUB"
            width={1280}
            height={1024}
            className="h-7 w-auto"
          />
        </Link>
      </header>

      {/* ── Backdrop (mobile only, when open) ──────────────── */}
      {open && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-label="關閉選單"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={cn(
          "bg-brand-dark text-white flex flex-col",
          // Always fixed; content area uses lg:pl-64 to offset on desktop
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:w-64"
        )}
      >
        {/* Header w/ logo + close button (close visible only on mobile) */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white">
          <Link
            href="/admin"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="CREATE HUB Admin"
              width={1280}
              height={1024}
              className="h-11 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 -mr-2 text-brand-dark hover:bg-brand-bg rounded"
            aria-label="關閉選單"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-5 border-b border-white/10">
          <div className="text-[10px] text-brand-accent tracking-[0.2em] uppercase font-semibold mb-1">
            Administrator
          </div>
          <div className="text-[14px] text-white font-medium truncate">
            {adminName}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 text-[13px] transition",
                  active
                    ? "bg-brand-accent/15 text-brand-accent font-semibold border-l-2 border-brand-accent"
                    : "text-white/75 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-0.5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            返回網站
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            登出
          </button>
        </div>
      </aside>
    </>
  );
}
