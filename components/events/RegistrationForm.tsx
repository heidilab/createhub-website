"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatEventDate } from "@/lib/date";
import { availabilityLabel } from "@/lib/utils";

export interface SessionOption {
  id: string;
  startDate: string;
  location: string | null;
  isFull: boolean;
  isRegistered: boolean;
  seatsRemaining: number | null;
  capacity: number | null;
}

interface Props {
  eventId: string;
  eventTitle: string;
  isFree: boolean;
  priceHkd: number;
  sessions: SessionOption[];
  allFull: boolean;
}

export default function RegistrationForm({
  eventId,
  eventTitle,
  isFree,
  priceHkd,
  sessions,
  allFull,
}: Props) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Pick first selectable session by default (not full, not already registered)
  const firstSelectable = sessions.find((s) => !s.isFull && !s.isRegistered);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    firstSelectable?.id ?? sessions[0]?.id ?? ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // WhatsApp gate: if profile has no WhatsApp, prompt before registration
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");

  const allRegistered =
    sessions.length > 0 && sessions.every((s) => s.isRegistered);

  const submitRegistration = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, sessionId: selectedSessionId }),
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

  const handleRegister = () => {
    if (!selectedSessionId) {
      setError("請揀選一個場次");
      return;
    }
    setError("");

    // WhatsApp gate
    const hasWhatsapp = !!profile?.whatsapp && profile.whatsapp.trim().length > 0;
    if (!hasWhatsapp) {
      setWhatsappInput("");
      setWhatsappError("");
      setWhatsappModalOpen(true);
      return;
    }

    void submitRegistration();
  };

  const handleSaveWhatsapp = async () => {
    setWhatsappError("");
    const digits = whatsappInput.replace(/\D/g, "");
    if (digits.length < 8) {
      setWhatsappError("請填寫有效嘅 WhatsApp 號碼（至少 8 位數字）");
      return;
    }
    setSavingWhatsapp(true);
    try {
      const res = await fetch("/api/profile/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: whatsappInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新失敗");
      setWhatsappModalOpen(false);
      // Profile snapshot will update via onSnapshot; proceed with registration immediately.
      await submitRegistration();
    } catch (err) {
      setWhatsappError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setSavingWhatsapp(false);
    }
  };

  // ── State 1: Loading ───────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white border border-brand-hair p-6 animate-pulse">
        <div className="h-4 bg-brand-bg w-2/3 mb-4" />
        <div className="h-10 bg-brand-bg" />
      </div>
    );
  }

  // ── State 2: Not logged in ─────────────────────────────────
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

  // ── State 3: Just succeeded inline ─────────────────────────
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

  // ── State 4: All sessions already registered by this user ──
  if (allRegistered) {
    return (
      <div className="bg-brand-accent/10 border border-brand-accent p-6">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-brand-dark mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[14px] font-bold text-brand-dark mb-1">
              你已報名所有場次
            </div>
            <p className="text-[12px] text-brand-muted leading-relaxed">
              詳情可去會員中心查看。
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

  // ── State 5: All sold out ──────────────────────────────────
  if (allFull) {
    return (
      <div className="bg-red-50 border border-red-200 p-6">
        <div className="text-[14px] font-bold text-red-700 mb-2">
          所有場次已滿額
        </div>
        <p className="text-[12px] text-red-600 leading-relaxed">
          此活動所有場次嘅名額均已額滿。如有疑問請聯絡 info@createhub.biz。
        </p>
      </div>
    );
  }

  // ── State 6: Logged in, can register ───────────────────────
  const hasMultipleSessions = sessions.length > 1;

  return (
    <div className="bg-white border border-brand-hair p-6">
      <div className="eyebrow-muted mb-3">報名參加</div>
      <div className="rule-accent mb-5" />

      {/* Session picker */}
      {hasMultipleSessions && (
        <div className="mb-5">
          <div className="text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-2.5">
            揀選場次 <span className="text-brand-accent">*</span>
          </div>
          <div className="space-y-2">
            {sessions.map((s) => {
              const disabled = s.isFull || s.isRegistered;
              const selected = s.id === selectedSessionId;
              return (
                <label
                  key={s.id}
                  className={`flex items-start gap-3 p-3 border cursor-pointer transition ${
                    disabled
                      ? "border-brand-hair bg-brand-bg/50 cursor-not-allowed opacity-60"
                      : selected
                      ? "border-brand-dark bg-brand-bg"
                      : "border-brand-rule hover:border-brand-accent"
                  }`}
                >
                  <input
                    type="radio"
                    name="session"
                    value={s.id}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => setSelectedSessionId(s.id)}
                    className="accent-brand-dark mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-brand-text">
                      {formatEventDate(s.startDate)}
                    </div>
                    {s.location && (
                      <div className="text-[11px] text-brand-softer truncate">
                        {s.location}
                      </div>
                    )}
                    <div className="text-[10px] mt-1">
                      {s.isRegistered ? (
                        <span className="text-brand-accent font-semibold">
                          你已報名此場
                        </span>
                      ) : (
                        (() => {
                          const a = availabilityLabel(
                            s.seatsRemaining,
                            s.capacity ?? null
                          );
                          const cls =
                            a.tone === "full"
                              ? "text-red-600 font-semibold"
                              : a.tone === "low"
                                ? "text-amber-700 font-semibold"
                                : "text-green-700 font-semibold";
                          return <span className={cls}>{a.text}</span>;
                        })()
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

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
        disabled={submitting || !selectedSessionId}
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

      {/* WhatsApp gate modal */}
      {whatsappModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingWhatsapp) {
              setWhatsappModalOpen(false);
            }
          }}
        >
          <div className="bg-white max-w-md w-full p-7 shadow-2xl">
            <div className="eyebrow-muted mb-3">最後一步</div>
            <div className="rule-accent mb-5" />
            <h3 className="font-serif text-[22px] text-brand-text mb-2">
              請填寫 WhatsApp 聯絡電話
            </h3>
            <p className="text-[13px] text-brand-muted leading-relaxed mb-5">
              我哋需要你嘅 WhatsApp 聯絡電話，以便活動有任何更新時通知你。填寫後會自動完成報名。
            </p>

            <div className="mb-4">
              <label
                htmlFor="whatsapp-gate"
                className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5"
              >
                WhatsApp 號碼 <span className="text-brand-accent">*</span>
              </label>
              <input
                id="whatsapp-gate"
                type="tel"
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value)}
                className="input"
                placeholder="+852 9xxx xxxx"
                autoComplete="tel"
                autoFocus
                disabled={savingWhatsapp}
              />
            </div>

            {whatsappError && (
              <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2 mb-4">
                {whatsappError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                disabled={savingWhatsapp}
                className="flex-1 text-[13px] text-brand-muted hover:text-brand-dark py-3 disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveWhatsapp}
                disabled={savingWhatsapp}
                className="flex-1 bg-brand-dark text-white py-3 text-[13px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
              >
                {savingWhatsapp ? "處理中…" : "儲存並報名"}
              </button>
            </div>
          </div>
        </div>
      )}
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
