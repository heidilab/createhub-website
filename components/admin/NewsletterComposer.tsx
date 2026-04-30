"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function NewsletterComposer({
  totalRecipients,
}: {
  totalRecipients: number;
}) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [includeEvents, setIncludeEvents] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; sent?: number; failed?: number } | null>(null);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      setError("主旨同內容都係必填");
      return;
    }
    if (
      !confirm(
        `確定發送呢封 Newsletter 畀 ${totalRecipients} 位訂閱者？\n\n主旨：${subject}\n\n呢個動作無法取消。`
      )
    )
      return;

    setSending(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          content: content.trim(),
          includeEvents,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發送失敗");
      setResult({ ok: true, sent: data.sent, failed: data.failed });
      setSubject("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "發送失敗");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-brand-hair p-6 lg:p-8 space-y-6">
      <div>
        <label className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
          主旨
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input"
          placeholder="例：4 月份商業活動搶先睇"
        />
      </div>

      <div>
        <label className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
          內容 <span className="text-brand-softer normal-case tracking-normal">(支援 HTML)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-[280px]"
          placeholder={"各位會員：\n\n本月我哋準備咗幾個精彩活動，誠邀各位參與……\n\n支援 HTML tag，例如 <strong>粗體</strong>、<br>換行、<a href=\"...\">連結</a>"}
        />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer bg-brand-bg border border-brand-hair p-4">
        <input
          type="checkbox"
          checked={includeEvents}
          onChange={(e) => setIncludeEvents(e.target.checked)}
          className="accent-brand-dark w-4 h-4 mt-0.5"
        />
        <div>
          <div className="text-[14px] font-semibold text-brand-text">
            自動附上即將舉行活動
          </div>
          <div className="text-[11px] text-brand-softer mt-0.5">
            最多 5 個即將舉行嘅活動會自動加喺 email 底
          </div>
        </div>
      </label>

      {result?.ok && (
        <div className="bg-brand-accent/10 border border-brand-accent px-4 py-3 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-brand-dark mt-0.5 flex-shrink-0" />
          <div className="text-[13px] text-brand-dark">
            Newsletter 發送完成！
            <br />
            成功 <strong>{result.sent}</strong> 封
            {result.failed ? `，失敗 ${result.failed} 封` : ""}
          </div>
        </div>
      )}

      {error && (
        <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </div>
      )}

      <div className="pt-6 border-t border-brand-hair flex items-center justify-between">
        <div className="text-[12px] text-brand-softer">
          將發送到 <strong className="text-brand-dark">{totalRecipients}</strong> 位訂閱者
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || totalRecipients === 0}
          className="inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-3 text-[13px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? "發送中…" : "發送 Newsletter"}
        </button>
      </div>
    </div>
  );
}
