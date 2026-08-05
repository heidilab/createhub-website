"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";

interface Props {
  eventId: string;
  defaultAddress?: string;
  defaultMapUrl?: string;
}

export default function SendVenueEmailButton({
  eventId,
  defaultAddress = "",
  defaultMapUrl = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(defaultAddress);
  const [mapUrl, setMapUrl] = useState(defaultMapUrl);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!address.trim()) {
      setError("請填寫活動地址");
      return;
    }
    setSending(true);
    setError("");
    setResult("");
    try {
      const res = await fetch(`/api/admin/events/${eventId}/send-venue-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueAddress: address, mapUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發送失敗");
      setResult(
        `已發送 ${data.sent} 封 · 略過 ${data.skipped}（已發過/已取消）· 失敗 ${data.failed}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "發送失敗");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-brand-rule text-brand-dark px-5 py-2.5 text-[13px] font-bold tracking-wide hover:border-brand-accent transition"
      >
        <MapPin className="w-4 h-4" />
        發送地點補充 Email
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white max-w-lg w-full p-7 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="eyebrow-muted mb-2">Venue Email</div>
                <h3 className="font-serif text-[20px] text-brand-text">
                  發送地點補充 Email
                </h3>
                <p className="text-[12px] text-brand-softer mt-1">
                  會發送畀呢個活動所有已確認嘅報名者。已發送過嘅人會自動略過，唔會重複收。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={sending}
                className="text-brand-softer hover:text-brand-dark"
                aria-label="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
                  活動地址 <span className="text-brand-accent">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input min-h-[70px]"
                  placeholder="香港..."
                  disabled={sending}
                />
              </div>
              <div>
                <label className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
                  Google Maps 連結（選填）
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="input"
                  placeholder="https://maps.app.goo.gl/..."
                  disabled={sending}
                />
              </div>
            </div>

            {error && (
              <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2 mt-4">
                {error}
              </div>
            )}
            {result && (
              <div className="text-[12px] text-green-700 bg-green-50 border border-green-200 px-3 py-2 mt-4">
                ✓ {result}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-brand-hair">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={sending}
                className="flex-1 text-[13px] text-brand-muted hover:text-brand-dark py-2.5 disabled:opacity-50"
              >
                {result ? "完成" : "取消"}
              </button>
              {!result && (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 bg-brand-dark text-white py-2.5 text-[13px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
                >
                  {sending ? "發送中…" : "確認發送"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
