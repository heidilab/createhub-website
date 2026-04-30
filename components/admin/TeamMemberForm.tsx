"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Save, Trash2, Loader2 } from "lucide-react";
import type { TeamMember } from "@/types";

interface Props {
  mode: "create" | "edit";
  initial?: TeamMember;
}

export default function TeamMemberForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameEn: initial?.nameEn ?? "",
    title: initial?.title ?? "",
    bio: initial?.bio ?? "",
    photoUrl: initial?.photoUrl ?? "",
    orderIndex: initial?.orderIndex ?? 99,
    isVisible: initial?.isVisible ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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
      fd.append("folder", "team");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上傳失敗");
      setForm((f) => ({ ...f, photoUrl: data.url }));
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
        orderIndex: Number(form.orderIndex) || 99,
      };
      const res = await fetch(
        mode === "create"
          ? "/api/admin/team"
          : `/api/admin/team/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "儲存失敗");
      router.push("/admin/team");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`確定刪除「${initial.name}」嘅團隊資料？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/team/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("刪除失敗");
      router.push("/admin/team");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Photo */}
      <Section title="照片">
        {form.photoUrl ? (
          <div className="relative w-48 aspect-[4/5] bg-brand-bg border border-brand-hair">
            <Image src={form.photoUrl} alt="Photo" fill sizes="240px" className="object-cover" />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, photoUrl: "" }))}
              className="absolute top-2 right-2 bg-white/95 px-2.5 py-1 text-[11px] text-red-600 font-semibold hover:bg-white"
            >
              移除
            </button>
          </div>
        ) : (
          <label className="inline-block border-2 border-dashed border-brand-rule p-8 cursor-pointer hover:border-brand-accent transition w-48 aspect-[4/5]">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="flex flex-col items-center justify-center h-full text-center">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 mb-2 text-brand-accent animate-spin" />
                  <div className="text-[11px] text-brand-softer">上傳中…</div>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-2 text-brand-accent" />
                  <div className="text-[12px] text-brand-muted">上傳照片</div>
                  <div className="text-[10px] text-brand-softer mt-1">建議 4:5 比例</div>
                </>
              )}
            </div>
          </label>
        )}
      </Section>

      {/* Basic */}
      <Section title="基本資料">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="中文姓名" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="英文姓名">
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) =>
                setForm((f) => ({ ...f, nameEn: e.target.value }))
              }
              className="input"
            />
          </Field>
        </div>

        <Field label="職銜" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="input"
            placeholder="例：共同創辦人 Co-Founder"
          />
        </Field>

        <Field label="簡介 Bio">
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="input min-h-[160px]"
            placeholder="成員背景、經驗、成就..."
          />
        </Field>
      </Section>

      {/* Display */}
      <Section title="顯示設定">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="排序編號" hint="數字越細越前（1 = 最前）">
            <input
              type="number"
              min="1"
              value={form.orderIndex}
              onChange={(e) =>
                setForm((f) => ({ ...f, orderIndex: Number(e.target.value) }))
              }
              className="input"
            />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 cursor-pointer py-2.5">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isVisible: e.target.checked }))
                }
                className="accent-brand-dark w-4 h-4"
              />
              <span className="text-[14px] text-brand-text">
                喺「關於我們」頁面顯示
              </span>
            </label>
          </div>
        </div>
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
            {deleting ? "刪除中…" : "刪除此成員"}
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
            {saving ? "儲存中…" : mode === "create" ? "新增成員" : "儲存變更"}
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
