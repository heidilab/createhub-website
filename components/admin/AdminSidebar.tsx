"use client";

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

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-dark text-white flex flex-col min-h-screen">
      <Link
        href="/admin"
        className="flex items-center gap-2 p-6 border-b border-white/10 bg-white"
      >
        <Image
          src="/logo.png"
          alt="CREATE HUB Admin"
          width={1280}
          height={1024}
          className="h-11 w-auto"
        />
      </Link>

      <div className="px-4 py-5 border-b border-white/10">
        <div className="text-[10px] text-brand-accent tracking-[0.2em] uppercase font-semibold mb-1">
          Administrator
        </div>
        <div className="text-[14px] text-white font-medium truncate">
          {adminName}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
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
  );
}
