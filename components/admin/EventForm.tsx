"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Save, Trash2, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Event } from "@/types";
import { toDate } from "@/lib/date";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

interface Props {
  mode: "create" | "edit";
  initial?: Event;
}

export default function EventForm({ mode, initial }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    coverImage: initial?.coverImage ?? "",
    eventType: initial?.eventType ?? "offline",
    category: initial?.category ?? "lecture",
    speakerName: initial?.speakerName ?? "",
    speakerBio: initial?.speakerBio ?? "",
    eventDate: toLocalInput(toDate(initial?.eventDate ?? null)),
    endDate: toLocalInput(toDate(initial?.endDate ?? null)),
    location: initial?.location ?? "",
    zoomLink: initial?.zoomLink ?? "",
    isFree: initial?.isFree ?? true,
    priceHkd: initial?.priceHkd ?? 0,
    capacity: initial?.capacity ?? 0,
    status: initial?.status ?? "upcoming",
    isPublished: initial?.isPublished ?? false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleTitle = (title: string) => {
    updateField("title", title);
    if (!initial?.slug || form.slug === slugify(form.title)) {
      updateField("slug", slugify(title));
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("只接受圖片檔案");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("圖片大小不能超過 5MB");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "events");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上傳失敗");
      updateField("coverImage", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        priceHkd: Number(form.priceHkd) || 0,
        capacity: Number(form.capacity) || null,
      };
      const res = await fetch(
        mode === "create"
          ? "/api/admin/events"
          : `/api/admin/events/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "儲存失敗");
      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`確定刪除活動「${initial.title}」？此操作不可復原。`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("刪除失敗");
      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <Section title="基本資料">
        <Field label="活動名稱" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleTitle(e.target.value)}
            className="input"
            placeholder="例：AI × 品牌建立實戰公開講座"
          />
        </Field>

        <Field
          label="Slug（URL 識別碼）"
          hint="自動由名稱生成，可手動修改"
        >
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="活動描述" required>
          <textarea
            required
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="input min-h-[160px]"
            placeholder="介紹活動內容、參加者可以學到什麼、活動流程等..."
          />
        </Field>
      </Section>

      {/* Cover */}
      <Section title="封面圖">
        {form.coverImage ? (
          <div className="relative w-full aspect-[16/9] bg-brand-bg border border-brand-hair mb-3">
            <Image
              src={form.coverImage}
              alt="Cover"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => updateField("coverImage", "")}
              className="absolute top-2 right-2 bg-white/95 px-3 py-1.5 text-[11px] text-red-600 font-semibold hover:bg-white"
            >
              移除
            </button>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-brand-rule py-10 text-center cursor-pointer hover:border-brand-accent transition">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 mx-auto mb-2 text-brand-accent animate-spin" />
                <div className="text-[12px] text-brand-softer">上傳中…</div>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 mx-auto mb-2 text-brand-accent" />
                <div className="text-[13px] text-brand-muted mb-1">撳呢度上傳封面圖</div>
                <div className="text-[10px] text-brand-softer">JPG / PNG · 最大 5MB · 建議 1600×900</div>
              </>
            )}
          </label>
        )}
      </Section>

      {/* Event meta */}
      <Section title="活動類型">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="活動形式" required>
            <select
              required
              value={form.eventType}
              onChange={(e) =>
                updateField("eventType", e.target.value as typeof form.eventType)
              }
              className="input"
            >
              <option value="offline">線下</option>
              <option value="online">線上</option>
              <option value="hybrid">混合</option>
            </select>
          </Field>
          <Field label="活動類別" required>
            <select
              required
              value={form.category}
              onChange={(e) =>
                updateField("category", e.target.value as typeof form.category)
              }
              className="input"
            >
              <option value="lecture">講座</option>
              <option value="workshop">工作坊</option>
              <option value="networking">交流會</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Datetime */}
      <Section title="時間與地點">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="活動開始時間" required>
            <input
              type="datetime-local"
              required
              value={form.eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="活動結束時間" hint="選填">
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        {form.eventType !== "online" && (
          <Field label="地點" required={form.eventType === "offline"}>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="input"
              placeholder="例：灣仔 xxx 中心 8 樓"
            />
          </Field>
        )}
        {form.eventType !== "offline" && (
          <Field
            label="Zoom 連結"
            hint="會喺報名確認 email 發送畀參加者"
          >
            <input
              type="url"
              value={form.zoomLink}
              onChange={(e) => updateField("zoomLink", e.target.value)}
              className="input"
              placeholder="https://zoom.us/j/..."
            />
          </Field>
        )}
      </Section>

      {/* Speaker */}
      <Section title="講師資料">
        <Field label="講師姓名">
          <input
            type="text"
            value={form.speakerName}
            onChange={(e) => updateField("speakerName", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="講師簡介">
          <textarea
            value={form.speakerBio}
            onChange={(e) => updateField("speakerBio", e.target.value)}
            className="input min-h-[100px]"
            placeholder="講師背景、經驗、成就..."
          />
        </Field>
      </Section>

      {/* Pricing */}
      <Section title="費用與名額">
        <div className="space-y-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => updateField("isFree", e.target.checked)}
              className="accent-brand-dark w-4 h-4"
            />
            <span className="text-[14px] text-brand-text">免費活動</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {!form.isFree && (
              <Field label="價格 (HK$)" required={!form.isFree}>
                <input
                  type="number"
                  min="0"
                  value={form.priceHkd}
                  onChange={(e) =>
                    updateField("priceHkd", Number(e.target.value))
                  }
                  className="input"
                />
              </Field>
            )}
            <Field label="名額上限" hint="留空 = 不限">
              <input
                type="number"
                min="0"
                value={form.capacity || ""}
                onChange={(e) =>
                  updateField("capacity", Number(e.target.value))
                }
                className="input"
                placeholder="不限"
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Publish */}
      <Section title="發布狀態">
        <Field label="狀態">
          <select
            value={form.status}
            onChange={(e) =>
              updateField("status", e.target.value as typeof form.status)
            }
            className="input"
          >
            <option value="upcoming">即將舉行</option>
            <option value="past">過往</option>
            <option value="cancelled">已取消</option>
          </select>
        </Field>

        <label className="flex items-start gap-2.5 cursor-pointer bg-brand-bg border border-brand-hair p-4">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => updateField("isPublished", e.target.checked)}
            className="accent-brand-dark w-4 h-4 mt-0.5"
          />
          <div>
            <div className="text-[14px] font-semibold text-brand-text">
              立即發布
            </div>
            <div className="text-[11px] text-brand-softer mt-0.5">
              發布後會喺活動列表顯示，會員可以報名
            </div>
          </div>
        </label>
      </Section>

      {error && (
        <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-brand-hair">
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 text-[13px] text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "刪除中…" : "刪除此活動"}
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[13px] text-brand-muted hover:text-brand-dark"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-3 text-[13px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "儲存中…" : mode === "create" ? "建立活動" : "儲存變更"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-8 border-b border-brand-hair">
      <div className="eyebrow-muted mb-5">{title}</div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
        {label}
        {required && <span className="text-brand-accent ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <div className="text-[11px] text-brand-softer mt-1.5">{hint}</div>
      )}
    </div>
  );
}
