"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "@/lib/firebase/auth";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NavbarProps {
  hasNews?: boolean;
}

export default function Navbar({ hasNews = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, isAdmin } = useAuth();

  const visibleLinks = NAV_LINKS.filter((l) => {
    if (l.conditional === "hasNews") return hasNews;
    return true;
  });

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="fixed top-[5px] left-0 right-0 z-40 bg-white border-b border-brand-hair">
      <nav className="container-edge px-5 lg:px-8 flex items-center justify-between h-[76px]">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="創研社 CREATE HUB 首頁">
          <Image
            src="/logo.png"
            alt="創研社 CREATE HUB"
            width={1280}
            height={1024}
            priority
            className="h-[60px] w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7 text-[13px] text-brand-muted tracking-[0.05em]">
          {visibleLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-dark transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "hover:text-brand-dark transition-colors",
                  pathname === link.href && "text-brand-dark font-semibold"
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3 relative">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 border border-brand-rule px-3.5 py-1.5 text-[13px] text-brand-muted hover:text-brand-dark hover:border-brand-dark transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">
                  {profile?.fullName || user.email}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-brand-hair shadow-sm py-2">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-[13px] text-brand-text hover:bg-brand-bg"
                  >
                    會員中心
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-[13px] text-brand-text hover:bg-brand-bg"
                    >
                      管理員後台
                    </Link>
                  )}
                  <div className="border-t border-brand-hair my-1" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-left text-brand-muted hover:bg-brand-bg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    登出
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="border border-brand-rule px-4 py-1.5 text-[13px] text-brand-muted hover:text-brand-dark hover:border-brand-dark transition"
              >
                登入
              </Link>
              <Link
                href="/register"
                className="bg-brand-dark text-white px-4 py-[9px] text-[13px] font-semibold tracking-wide hover:bg-brand-text transition"
              >
                立即加入
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-brand-dark"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-brand-hair bg-white">
          <div className="container-edge px-5 py-5 flex flex-col">
            {visibleLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 text-[14px] text-brand-text border-b border-brand-hair"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 text-[14px] text-brand-text border-b border-brand-hair"
                >
                  {link.label}
                </Link>
              )
            )}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="py-3 text-[14px] text-brand-text border-b border-brand-hair"
                >
                  會員中心
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="py-3 text-[14px] text-brand-text border-b border-brand-hair"
                  >
                    管理員後台
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="py-3 text-[14px] text-left text-brand-muted"
                >
                  登出
                </button>
              </>
            ) : (
              <div className="flex gap-3 mt-4">
                <Link
                  href="/login"
                  className="flex-1 text-center border border-brand-rule py-2 text-[13px] text-brand-muted"
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center bg-brand-dark text-white py-2 text-[13px] font-semibold"
                >
                  立即加入
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
