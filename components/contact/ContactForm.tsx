"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    category: "course" as "course" | "event" | "other",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發送失敗");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發送失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-12 h-12 text-brand-accent mx-auto mb-5" />
        <h3 className="font-serif text-[24px] text-brand-text mb-3">
          多謝你嘅留言
        </h3>
        <p className="text-[13px] text-brand-muted max-w-sm mx-auto leading-relaxed">
          我哋已經收到你嘅訊息，會喺兩個工作天內透過電郵回覆你。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handle} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="姓名" htmlFor="name" required>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            autoComplete="name"
          />
        </Field>
        <Field label="電郵" htmlFor="email" required>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="WhatsApp（選填）" htmlFor="whatsapp">
          <input
            id="whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="input"
            placeholder="+852 9xxx xxxx"
            autoComplete="tel"
          />
        </Field>
        <Field label="查詢類別" htmlFor="category" required>
          <select
            id="category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as typeof form.category })
            }
            className="input"
          >
            <option value="course">課程查詢</option>
            <option value="event">活動查詢</option>
            <option value="other">其他</option>
          </select>
        </Field>
      </div>

      <Field label="查詢內容" htmlFor="message" required>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input"
          placeholder="請詳細描述你嘅查詢內容…"
        />
      </Field>

      {error && (
        <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-3 text-[14px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
      >
        {submitting ? "發送中…" : "發送訊息"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5"
      >
        {label}
        {required && <span className="text-brand-accent ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
