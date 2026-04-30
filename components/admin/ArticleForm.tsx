"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Save, Trash2, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { toDate } from "@/lib/date";
import type { Article } from "@/types";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

interface Props {
  mode: "create" | "edit";
  initial?: Article;
}

export default function ArticleForm({ mode, initial }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? "",
    author: initial?.author ?? "創研社編輯團隊",
    category: initial?.category ?? "insight",
    tags: (initial?.tags ?? []).join(", "),
    publishedAt: toLocalInput(toDate(initial?.publishedAt ?? null)),
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
      fd.append("folder", "articles");
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
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : form.isPublished
          ? new Date().toISOString()
          : null,
      };
      const res = await fetch(
        mode === "create"
          ? "/api/admin/articles"
          : `/api/admin/articles/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "儲存失敗");
      router.push("/admin/news");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`確定刪除文章「${initial.title}」？此操作不可復原。`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("刪除失敗");
      router.push("/admin/news");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="文章內容">
        <Field label="標題" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleTitle(e.target.value)}
            className="input"
            placeholder="例：2026 年香港商業趨勢前瞻"
          />
        </Field>

        <Field label="URL Slug" hint="自動由標題生成，URL 會變成 /news/[slug]">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="input"
          />
        </Field>

        <Field
          label="摘要"
          hint="顯示喺文章列表，建議 80-160 字"
          required
        >
          <textarea
            required
            rows={3}
            value={form.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
            className="input"
            placeholder="一段簡短嘅文章引子..."
          />
        </Field>

        <Field label="正文（支援 Markdown）" required>
          <textarea
            required
            rows={16}
            value={form.content}
            onChange={(e) => updateField("content", e.target.value)}
            className="input font-mono text-[13px]"
            placeholder={"# 大標題\n\n普通段落文字。\n\n## 小標題\n\n- 項目一\n- 項目二\n\n**粗體** *斜體* [連結](https://example.com)"}
          />
        </Field>
      </Section>

      <Section title="封面圖">
        {form.coverImage ? (
          <div className="relative w-full aspect-[16/9] bg-brand-bg border border-brand-hair">
            <Image src={form.coverImage} alt="Cover" fill sizes="800px" className="object-cover" />
            <button
              type="button"
              onClick={() => updateField("coverImage", "")}
              className="absolute top-2 right-2 bg-white/95 px-3 py-1.5 text-[11px] text-red-600 font-semibold"
            >
              移除
            </button>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-brand-rule py-10 text-center cursor-pointer hover:border-brand-accent transition">
            <input
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

      <Section title="分類 / 標籤 / 作者">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="分類">
            <select
              value={form.category}
              onChange={(e) =>
                updateField("category", e.target.value as typeof form.category)
              }
              className="input"
            >
              <option value="insight">商業洞察</option>
              <option value="news">行業新聞</option>
              <option value="case-study">個案研究</option>
              <option value="tutorial">教學專欄</option>
            </select>
          </Field>
          <Field label="作者">
            <input
              type="text"
              value={form.author}
              onChange={(e) => updateField("author", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <Field label="標籤" hint="用英文逗號分隔，例：SME, AI, 品牌建立">
          <input
            type="text"
            value={form.tags}
            onChange={(e) => updateField("tags", e.target.value)}
            className="input"
          />
        </Field>
      </Section>

      <Section title="發布設定">
        <Field
          label="發布時間"
          hint="留空 = 勾選「立即發布」時自動用當下時間"
        >
          <input
            type="datetime-local"
            value={form.publishedAt}
            onChange={(e) => updateField("publishedAt", e.target.value)}
            className="input"
          />
        </Field>
        <label className="flex items-start gap-2.5 cursor-pointer bg-brand-bg border border-brand-hair p-4">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => updateField("isPublished", e.target.checked)}
            className="accent-brand-dark w-4 h-4 mt-0.5"
          />
          <div>
            <div className="text-[14px] font-semibold text-brand-text">立即發布</div>
            <div className="text-[11px] text-brand-softer mt-0.5">
              發布後文章會喺 /news 顯示，同時 Navbar 會自動顯示「商業快訊」連結
            </div>
          </div>
        </label>
      </Section>

      {error && (
        <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-brand-hair">
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 text-[13px] text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "刪除中…" : "刪除此文章"}
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
            {saving ? "儲存中…" : mode === "create" ? "建立文章" : "儲存變更"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
