"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface Props {
  eventId: string;
  eventTitle: string;
  isFree: boolean;
  priceHkd: number;
  alreadyRegistered?: boolean;
}

export default function RegistrationForm({
  eventId,
  eventTitle,
  isFree,
  priceHkd,
  alreadyRegistered,
}: Props) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(alreadyRegistered ?? false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "報名失敗");

      // Paid event → redirect to Stripe Checkout
      if (data.mode === "paid" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Free event → confirm inline
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "報名失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  // State 1: Loading
  if (loading) {
    return (
      <div className="bg-white border border-brand-hair p-6 animate-pulse">
        <div className="h-4 bg-brand-bg w-2/3 mb-4" />
        <div className="h-10 bg-brand-bg" />
      </div>
    );
  }

  // State 2: Not logged in
  if (!user) {
    return (
      <div className="bg-white border border-brand-hair p-6">
        <div className="flex items-start gap-3 mb-5">
          <Lock className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[14px] font-bold text-brand-text mb-1">
              需要登入以報名
            </div>
            <p className="text-[12px] text-brand-softer leading-relaxed">
              創研社活動只限會員參加，請先登入或成為會員。
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href={`/login?redirect=/events/${eventId}`}
            className="w-full text-center bg-brand-dark text-white py-3 text-[14px] font-bold tracking-wide hover:bg-brand-text transition"
          >
            登入
          </Link>
          <Link
            href={`/register?redirect=/events/${eventId}`}
            className="w-full text-center border border-brand-rule text-brand-muted py-3 text-[14px] font-semibold hover:text-brand-dark hover:border-brand-dark transition"
          >
            立即免費加入
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Already registered (or just succeeded)
  if (success) {
    return (
      <div className="bg-brand-accent/10 border border-brand-accent p-6">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-brand-dark mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[14px] font-bold text-brand-dark mb-1">
              你已成功報名
            </div>
            <p className="text-[12px] text-brand-muted leading-relaxed">
              報名確認信已寄去你嘅電郵。如有查詢，請聯絡 info@createhub.biz。
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[12px] font-bold text-brand-accent border-b border-brand-accent pb-[1px] hover:text-brand-dark hover:border-brand-dark"
        >
          前往會員中心 →
        </Link>
      </div>
    );
  }

  // State 4: Logged in, not registered
  return (
    <div className="bg-white border border-brand-hair p-6">
      <div className="eyebrow-muted mb-3">報名參加</div>
      <div className="rule-accent mb-5" />
      <div className="text-[13px] text-brand-muted leading-relaxed mb-4">
        確認以下資料後，撳「立即報名」完成登記。
      </div>

      <div className="space-y-2.5 text-[13px] mb-5">
        <Row label="姓名" value={profile?.fullName || user.displayName || "—"} />
        <Row label="電郵" value={profile?.email || user.email || "—"} />
        {profile?.whatsapp && <Row label="WhatsApp" value={profile.whatsapp} />}
      </div>

      <div className="pt-4 border-t border-brand-hair flex items-center justify-between mb-5">
        <span className="text-[11px] text-brand-softer tracking-[0.15em] uppercase">
          費用
        </span>
        <span className="font-serif text-[20px] font-bold text-brand-dark">
          {isFree ? "免費" : `HK$${priceHkd.toLocaleString()}`}
        </span>
      </div>

      {error && (
        <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleRegister}
        disabled={submitting}
        className="w-full bg-brand-dark text-white py-3 text-[14px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
      >
        {submitting
          ? "處理中…"
          : isFree
          ? `立即報名「${eventTitle}」`
          : `前往付款 HK$${priceHkd.toLocaleString()}`}
      </button>

      <p className="text-[11px] text-brand-softer mt-4 leading-relaxed">
        {isFree
          ? "撳「立即報名」表示同意創研社嘅活動條款。"
          : "撳「前往付款」會跳轉至 Stripe 安全付款頁面。支援信用卡 / Apple Pay / Google Pay / AlipayHK / WeChat Pay。"}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-brand-softer">{label}</span>
      <span className="text-brand-text font-medium text-right truncate">
        {value}
      </span>
    </div>
  );
}
