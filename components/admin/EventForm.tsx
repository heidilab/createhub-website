"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Save,
  Trash2,
  Loader2,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Event, Speaker } from "@/types";
import { toDate } from "@/lib/date";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

interface SpeakerDraft extends Speaker {
  _key: string;
}

interface SessionDraft {
  _key: string;
  id: string;
  startDate: string; // datetime-local
  endDate: string;
  location: string;
  zoomLink: string;
  capacity: string; // string in form, parsed on submit
}

function speakersFromInitial(initial?: Event): SpeakerDraft[] {
  if (initial?.speakers && initial.speakers.length > 0) {
    return initial.speakers.map((s) => ({ ...s, _key: newId() }));
  }
  return [{ _key: newId(), name: "", bio: "", photoUrl: "" }];
}

function sessionsFromInitial(initial?: Event): SessionDraft[] {
  if (initial?.sessions && initial.sessions.length > 0) {
    return initial.sessions.map((s) => ({
      _key: newId(),
      id: s.id,
      startDate: toLocalInput(toDate(s.startDate ?? null)),
      endDate: toLocalInput(toDate(s.endDate ?? null)),
      location: s.location ?? "",
      zoomLink: s.zoomLink ?? "",
      capacity: s.capacity ? String(s.capacity) : "",
    }));
  }
  return [
    {
      _key: newId(),
      id: newId(),
      startDate: "",
      endDate: "",
      location: "",
      zoomLink: "",
      capacity: "",
    },
  ];
}

interface Props {
  mode: "create" | "edit";
  initial?: Event;
}

export default function EventForm({ mode, initial }: Props) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    coverImage: initial?.coverImage ?? "",
    eventType: initial?.eventType ?? "offline",
    category: initial?.category ?? "lecture",
    isFree: initial?.isFree ?? true,
    priceHkd: initial?.priceHkd ?? 0,
    status: initial?.status ?? "upcoming",
    isPublished: initial?.isPublished ?? false,
  });

  const [speakers, setSpeakers] = useState<SpeakerDraft[]>(
    speakersFromInitial(initial)
  );
  const [speakerEmailInput, setSpeakerEmailInput] = useState("");
  const [speakerEmails, setSpeakerEmails] = useState<string[]>(
    initial?.speakerEmails ?? []
  );
  const [sessions, setSessions] = useState<SessionDraft[]>(
    sessionsFromInitial(initial)
  );

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingSpeakerKey, setUploadingSpeakerKey] = useState<string | null>(
    null
  );
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

  // ── Image uploads ───────────────────────────────────────────
  const uploadImage = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) throw new Error("只接受圖片檔案");
    if (file.size > 5 * 1024 * 1024) throw new Error("圖片大小不能超過 5MB");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "events");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "上傳失敗");
    return data.url as string;
  };

  const handleCoverFile = async (file: File) => {
    setUploadingCover(true);
    setError("");
    try {
      const url = await uploadImage(file);
      updateField("coverImage", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSpeakerPhoto = async (key: string, file: File) => {
    setUploadingSpeakerKey(key);
    setError("");
    try {
      const url = await uploadImage(file);
      setSpeakers((arr) =>
        arr.map((s) => (s._key === key ? { ...s, photoUrl: url } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploadingSpeakerKey(null);
    }
  };

  // ── Speakers ────────────────────────────────────────────────
  const addSpeaker = () =>
    setSpeakers((arr) => [
      ...arr,
      { _key: newId(), name: "", bio: "", photoUrl: "" },
    ]);
  const removeSpeaker = (key: string) =>
    setSpeakers((arr) =>
      arr.length > 1 ? arr.filter((s) => s._key !== key) : arr
    );
  const updateSpeaker = (key: string, patch: Partial<Speaker>) =>
    setSpeakers((arr) =>
      arr.map((s) => (s._key === key ? { ...s, ...patch } : s))
    );

  // ── Speaker emails ──────────────────────────────────────────
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Pure parser — returns the merged deduped list plus any invalid tokens.
   * Used by both the "Enter/加入" handler and the submit handler (so pending
   * text is never silently dropped).
   */
  const parsePendingEmails = (
    raw: string,
    existing: string[]
  ): { merged: string[]; invalid: string[] } => {
    const trimmed = raw.trim();
    if (!trimmed) return { merged: existing, invalid: [] };
    const candidates = trimmed
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    const valid = candidates.filter((e) => EMAIL_RE.test(e));
    const invalid = candidates.filter((e) => !EMAIL_RE.test(e));
    const merged = Array.from(
      new Set([...existing, ...valid].map((e) => e.toLowerCase()))
    );
    return { merged, invalid };
  };

  const commitSpeakerEmail = () => {
    const { merged, invalid } = parsePendingEmails(
      speakerEmailInput,
      speakerEmails
    );
    if (invalid.length > 0) {
      setError(`電郵格式無效：${invalid.join(", ")}`);
      return;
    }
    setSpeakerEmails(merged);
    setSpeakerEmailInput("");
    setError("");
  };
  const removeSpeakerEmail = (email: string) =>
    setSpeakerEmails((arr) => arr.filter((e) => e !== email));

  // ── Sessions ────────────────────────────────────────────────
  const addSession = () =>
    setSessions((arr) => [
      ...arr,
      {
        _key: newId(),
        id: newId(),
        startDate: "",
        endDate: "",
        location: "",
        zoomLink: "",
        capacity: "",
      },
    ]);
  const removeSession = (key: string) =>
    setSessions((arr) =>
      arr.length > 1 ? arr.filter((s) => s._key !== key) : arr
    );
  const updateSession = (key: string, patch: Partial<SessionDraft>) =>
    setSessions((arr) =>
      arr.map((s) => (s._key === key ? { ...s, ...patch } : s))
    );

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Auto-commit any pending speaker email in the input box before submit
    // (so admin doesn't need to remember pressing Enter — the biggest UX trap).
    const { merged: finalSpeakerEmails, invalid } = parsePendingEmails(
      speakerEmailInput,
      speakerEmails
    );
    if (invalid.length > 0) {
      setError(`講師電郵格式無效：${invalid.join(", ")}`);
      return;
    }
    // Sync UI state so the chip appears + input clears
    if (finalSpeakerEmails.length !== speakerEmails.length) {
      setSpeakerEmails(finalSpeakerEmails);
      setSpeakerEmailInput("");
    }

    // Validate at least one speaker name
    const validSpeakers = speakers
      .map((s) => ({
        name: s.name.trim(),
        bio: s.bio?.trim() || undefined,
        photoUrl: s.photoUrl?.trim() || undefined,
      }))
      .filter((s) => s.name.length > 0);
    if (validSpeakers.length === 0) {
      setError("最少要有一位講師（請填寫姓名）");
      return;
    }

    // Validate sessions
    if (sessions.length === 0) {
      setError("最少要有一個活動場次");
      return;
    }
    for (let idx = 0; idx < sessions.length; idx++) {
      const s = sessions[idx];
      if (!s.startDate) {
        setError(`第 ${idx + 1} 場：請填寫開始時間`);
        return;
      }
      if (form.eventType !== "online" && !s.location.trim()) {
        setError(`第 ${idx + 1} 場：請填寫地點`);
        return;
      }
    }

    const sessionsPayload = sessions.map((s) => ({
      id: s.id,
      startDate: new Date(s.startDate).toISOString(),
      endDate: s.endDate ? new Date(s.endDate).toISOString() : null,
      location: s.location.trim() || null,
      zoomLink: s.zoomLink.trim() || null,
      capacity: s.capacity ? Number(s.capacity) : null,
    }));

    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      coverImage: form.coverImage || null,
      eventType: form.eventType,
      category: form.category,
      speakers: validSpeakers,
      speakerEmails: finalSpeakerEmails,
      sessions: sessionsPayload,
      isFree: form.isFree,
      priceHkd: Number(form.priceHkd) || 0,
      status: form.status,
      isPublished: form.isPublished,
    };

    setSaving(true);
    try {
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

        <Field label="Slug（URL 識別碼）" hint="自動由名稱生成，可手動修改">
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

      {/* Cover / Promo image */}
      <Section title="活動宣傳圖（4:5）">
        <p className="text-[12px] text-brand-softer mb-3">
          會顯示於主頁活動列表同活動詳情頁面。請上傳 1080×1350px（4:5 直度）。
        </p>
        {form.coverImage ? (
          <div className="relative w-full max-w-[280px] aspect-[4/5] bg-brand-bg border border-brand-hair mb-3">
            <Image
              src={form.coverImage}
              alt="Cover"
              fill
              sizes="280px"
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
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCoverFile(f);
              }}
            />
            {uploadingCover ? (
              <>
                <Loader2 className="w-6 h-6 mx-auto mb-2 text-brand-accent animate-spin" />
                <div className="text-[12px] text-brand-softer">上傳中…</div>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 mx-auto mb-2 text-brand-accent" />
                <div className="text-[13px] text-brand-muted mb-1">
                  撳呢度上傳活動宣傳圖
                </div>
                <div className="text-[10px] text-brand-softer">
                  JPG / PNG · 最大 5MB · 1080×1350px (4:5 直度)
                </div>
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

      {/* Sessions */}
      <Section
        title="活動場次"
        action={
          <button
            type="button"
            onClick={addSession}
            className="inline-flex items-center gap-1.5 text-[12px] text-brand-accent hover:text-brand-dark font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            新增場次
          </button>
        }
      >
        <p className="text-[12px] text-brand-softer mb-2">
          一個活動可以有多場（例如分兩日舉行），每場有獨立日期、地點、名額。報名者可選擇參加邊一場。
        </p>
        <div className="space-y-4">
          {sessions.map((s, idx) => (
            <div
              key={s._key}
              className="border border-brand-hair p-5 bg-brand-bg/40 relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-brand-dark">
                  <GripVertical className="w-3.5 h-3.5 text-brand-softer" />
                  第 {idx + 1} 場
                </div>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSession(s._key)}
                    className="text-brand-softer hover:text-red-600"
                    aria-label="移除呢場"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="開始時間" required>
                  <input
                    type="datetime-local"
                    required
                    value={s.startDate}
                    onChange={(e) =>
                      updateSession(s._key, { startDate: e.target.value })
                    }
                    className="input"
                  />
                </Field>
                <Field label="結束時間" hint="選填">
                  <input
                    type="datetime-local"
                    value={s.endDate}
                    onChange={(e) =>
                      updateSession(s._key, { endDate: e.target.value })
                    }
                    className="input"
                  />
                </Field>
              </div>

              {form.eventType !== "online" && (
                <Field label="地點" required={form.eventType === "offline"}>
                  <input
                    type="text"
                    value={s.location}
                    onChange={(e) =>
                      updateSession(s._key, { location: e.target.value })
                    }
                    className="input"
                    placeholder="例：Link Hub｜荔枝角永康街..."
                  />
                </Field>
              )}
              {form.eventType !== "offline" && (
                <Field label="Zoom 連結" hint="會喺報名確認 email 發送畀參加者">
                  <input
                    type="url"
                    value={s.zoomLink}
                    onChange={(e) =>
                      updateSession(s._key, { zoomLink: e.target.value })
                    }
                    className="input"
                    placeholder="https://zoom.us/j/..."
                  />
                </Field>
              )}

              <Field label="名額上限" hint="留空 = 不限">
                <input
                  type="number"
                  min="0"
                  value={s.capacity}
                  onChange={(e) =>
                    updateSession(s._key, { capacity: e.target.value })
                  }
                  className="input"
                  placeholder="不限"
                />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      {/* Speakers */}
      <Section
        title="講師資料"
        action={
          <button
            type="button"
            onClick={addSpeaker}
            className="inline-flex items-center gap-1.5 text-[12px] text-brand-accent hover:text-brand-dark font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            新增講師
          </button>
        }
      >
        <p className="text-[12px] text-brand-softer mb-2">
          可以新增多位講師。圖片請上傳 1:1 正方形比例，活動頁面會自動裁剪成圓形顯示。
        </p>
        <div className="space-y-4">
          {speakers.map((sp, idx) => (
            <div
              key={sp._key}
              className="border border-brand-hair p-5 bg-brand-bg/40 relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-[12px] font-semibold text-brand-dark">
                  講師 {idx + 1}
                </div>
                {speakers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpeaker(sp._key)}
                    className="text-brand-softer hover:text-red-600"
                    aria-label="移除呢位講師"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {sp.photoUrl ? (
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border border-brand-hair">
                      <Image
                        src={sp.photoUrl}
                        alt={sp.name || "Speaker"}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateSpeaker(sp._key, { photoUrl: undefined })
                        }
                        className="absolute -top-1 -right-1 bg-white border border-brand-hair rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 hover:border-red-300"
                        aria-label="移除圖片"
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-28 h-28 rounded-full border-2 border-dashed border-brand-rule flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent transition text-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleSpeakerPhoto(sp._key, f);
                        }}
                      />
                      {uploadingSpeakerKey === sp._key ? (
                        <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-brand-accent mb-1" />
                          <span className="text-[10px] text-brand-softer leading-tight">
                            上載
                            <br />
                            1:1 圖片
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-3">
                  <Field label="講師姓名" required>
                    <input
                      type="text"
                      value={sp.name}
                      onChange={(e) =>
                        updateSpeaker(sp._key, { name: e.target.value })
                      }
                      className="input"
                      placeholder="例：陳大文"
                    />
                  </Field>
                  <Field label="講師簡介">
                    <textarea
                      value={sp.bio ?? ""}
                      onChange={(e) =>
                        updateSpeaker(sp._key, { bio: e.target.value })
                      }
                      className="input min-h-[80px]"
                      placeholder="講師背景、經驗、成就..."
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Speaker notification emails */}
      <Section title="講師通知電郵">
        <p className="text-[12px] text-brand-softer mb-2">
          每次有人報名活動，呢度填嘅電郵會收到通知（連同 info@createhub.biz）。可以加多過一個。
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {speakerEmails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1.5 bg-brand-dark text-white text-[12px] px-3 py-1.5"
            >
              {email}
              <button
                type="button"
                onClick={() => removeSpeakerEmail(email)}
                className="hover:text-red-300"
                aria-label={`移除 ${email}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {speakerEmails.length === 0 && (
            <span className="text-[11px] text-brand-softer italic">
              暫未設定（只會通知 info@createhub.biz）
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={speakerEmailInput}
            onChange={(e) => setSpeakerEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commitSpeakerEmail();
              }
            }}
            onBlur={() => {
              // Auto-commit when input loses focus so admin doesn't need to remember Enter
              if (speakerEmailInput.trim()) commitSpeakerEmail();
            }}
            className="input flex-1"
            placeholder="speaker@example.com（按 Enter 加入）"
          />
          <button
            type="button"
            onClick={commitSpeakerEmail}
            className="px-4 bg-brand-bg border border-brand-rule text-[12px] font-semibold text-brand-dark hover:border-brand-accent"
          >
            加入
          </button>
        </div>
        {speakerEmailInput.trim() && (
          <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
            ⚠️ 你打咗 <strong>{speakerEmailInput.trim()}</strong> 但未加入。撳「加入」或 Enter，儲存時亦會自動加入。
          </div>
        )}
      </Section>

      {/* Pricing */}
      <Section title="費用">
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

          {!form.isFree && (
            <Field label="價格 (HK$)" required={!form.isFree}>
              <input
                type="number"
                min="0"
                value={form.priceHkd}
                onChange={(e) =>
                  updateField("priceHkd", Number(e.target.value))
                }
                className="input max-w-[200px]"
              />
            </Field>
          )}
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
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-8 border-b border-brand-hair">
      <div className="flex items-center justify-between mb-5">
        <div className="eyebrow-muted">{title}</div>
        {action}
      </div>
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
