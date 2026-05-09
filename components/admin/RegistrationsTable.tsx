"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRightLeft, X, Loader2 } from "lucide-react";

interface RegistrationRow {
  id: string;
  sessionId: string;
  name: string;
  email: string;
  whatsapp: string;
  status: string;
  paymentStatus: string;
  registeredAt: string | null;
}

interface SessionInfo {
  id: string;
  startDate: string;
  location: string | null;
}

interface EventOption {
  id: string;
  title: string;
  sessions: SessionInfo[];
}

interface SessionGroup {
  sessionId: string;
  sessionLabel: string;
  rows: RegistrationRow[];
}

interface Props {
  eventId: string;
  sessions: SessionInfo[];
  groupedRows: SessionGroup[];
  allEvents: EventOption[];
}

const STATUS_LABEL: Record<string, string> = {
  paid: "已付款",
  free: "免費",
  pending: "待付款",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sessionLabel(s: SessionInfo): string {
  const date = s.startDate ? new Date(s.startDate) : null;
  const dateStr = date
    ? `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : s.id;
  return s.location ? `${dateStr} · ${s.location}` : dateStr;
}

export default function RegistrationsTable({
  eventId,
  sessions,
  groupedRows,
  allEvents,
}: Props) {
  const router = useRouter();

  const [moveModal, setMoveModal] = useState<{
    open: boolean;
    reg: RegistrationRow | null;
    targetEventId: string;
    targetSessionId: string;
  }>({
    open: false,
    reg: null,
    targetEventId: eventId,
    targetSessionId: "",
  });

  const [busyId, setBusyId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState("");
  const [moving, setMoving] = useState(false);

  const handleDelete = async (reg: RegistrationRow) => {
    if (
      !confirm(
        `確定刪除 ${reg.name}（${reg.email}）嘅報名記錄？此操作不可復原。`
      )
    )
      return;
    setBusyId(reg.id);
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "刪除失敗");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "刪除失敗");
    } finally {
      setBusyId(null);
    }
  };

  const openMove = (reg: RegistrationRow) => {
    setMoveModal({
      open: true,
      reg,
      targetEventId: eventId,
      targetSessionId: sessions[0]?.id ?? "",
    });
    setMoveError("");
  };

  const targetEventOption = allEvents.find(
    (e) => e.id === moveModal.targetEventId
  );

  const handleMove = async () => {
    if (!moveModal.reg) return;
    if (!moveModal.targetSessionId) {
      setMoveError("請揀目標場次");
      return;
    }
    setMoving(true);
    setMoveError("");
    try {
      const res = await fetch(
        `/api/admin/registrations/${moveModal.reg.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: moveModal.targetEventId,
            sessionId: moveModal.targetSessionId,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "轉移失敗");
      setMoveModal({
        open: false,
        reg: null,
        targetEventId: eventId,
        targetSessionId: "",
      });
      router.refresh();
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : "轉移失敗");
    } finally {
      setMoving(false);
    }
  };

  if (groupedRows.length === 0) {
    return (
      <div className="bg-white border border-dashed border-brand-rule p-16 text-center">
        <h3 className="font-serif text-[20px] text-brand-text mb-2">
          仲未有人報名
        </h3>
        <p className="text-[13px] text-brand-softer">
          當會員報名呢個活動，名單會喺度顯示。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {groupedRows.map((group) => (
          <section key={group.sessionId}>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="eyebrow-muted mb-1">場次</div>
                <h2 className="font-serif text-[18px] text-brand-text">
                  {group.sessionLabel}
                </h2>
              </div>
              <span className="text-[12px] text-brand-softer">
                {group.rows.length} 個報名
              </span>
            </div>
            <div className="bg-white border border-brand-hair overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-brand-bg border-b border-brand-hair">
                  <tr className="text-left">
                    <Th>姓名</Th>
                    <Th>電郵</Th>
                    <Th>WhatsApp</Th>
                    <Th>狀態</Th>
                    <Th>報名時間</Th>
                    <Th>操作</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-hair">
                  {group.rows.map((r) => (
                    <tr key={r.id} className="hover:bg-brand-bg/50">
                      <td className="p-3 font-semibold text-brand-text">
                        {r.name}
                      </td>
                      <td className="p-3 text-brand-muted">{r.email}</td>
                      <td className="p-3 text-brand-muted">
                        {r.whatsapp || (
                          <span className="text-brand-softer italic">
                            未填寫
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <StatusBadge
                          paymentStatus={r.paymentStatus}
                          status={r.status}
                        />
                      </td>
                      <td className="p-3 text-brand-softer whitespace-nowrap">
                        {formatDate(r.registeredAt)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openMove(r)}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-dark disabled:opacity-50"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            轉移
                          </button>
                          <span className="text-brand-hair">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {busyId === r.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* Move modal */}
      {moveModal.open && moveModal.reg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white max-w-md w-full p-7 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="eyebrow-muted mb-2">轉移報名記錄</div>
                <h3 className="font-serif text-[20px] text-brand-text">
                  {moveModal.reg.name}
                </h3>
                <p className="text-[12px] text-brand-softer mt-0.5">
                  {moveModal.reg.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMoveModal({ ...moveModal, open: false, reg: null })
                }
                disabled={moving}
                className="text-brand-softer hover:text-brand-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
                  目標活動
                </label>
                <select
                  value={moveModal.targetEventId}
                  onChange={(e) => {
                    const newEvent = allEvents.find(
                      (ev) => ev.id === e.target.value
                    );
                    setMoveModal({
                      ...moveModal,
                      targetEventId: e.target.value,
                      targetSessionId: newEvent?.sessions[0]?.id ?? "",
                    });
                  }}
                  className="input"
                  disabled={moving}
                >
                  {allEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                      {ev.id === eventId ? "（同一活動）" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
                  目標場次
                </label>
                <select
                  value={moveModal.targetSessionId}
                  onChange={(e) =>
                    setMoveModal({
                      ...moveModal,
                      targetSessionId: e.target.value,
                    })
                  }
                  className="input"
                  disabled={moving}
                >
                  {targetEventOption?.sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {sessionLabel(s)}
                      {moveModal.targetEventId === eventId &&
                      s.id === moveModal.reg?.sessionId
                        ? "（目前場次）"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {moveError && (
              <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2 mt-4">
                {moveError}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-brand-hair">
              <button
                type="button"
                onClick={() =>
                  setMoveModal({ ...moveModal, open: false, reg: null })
                }
                disabled={moving}
                className="flex-1 text-[13px] text-brand-muted hover:text-brand-dark py-2.5 disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleMove}
                disabled={moving || !moveModal.targetSessionId}
                className="flex-1 bg-brand-dark text-white py-2.5 text-[13px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
              >
                {moving ? "處理中…" : "確認轉移"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="p-3 text-[10px] text-brand-softer tracking-[0.15em] uppercase font-semibold">
      {children}
    </th>
  );
}

function StatusBadge({
  paymentStatus,
  status,
}: {
  paymentStatus: string;
  status: string;
}) {
  if (status === "cancelled") {
    return (
      <span className="text-[10px] bg-red-50 text-red-700 px-2 py-[2px] font-semibold tracking-wider">
        已取消
      </span>
    );
  }
  if (paymentStatus === "pending") {
    return (
      <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-[2px] font-semibold tracking-wider">
        待付款
      </span>
    );
  }
  if (paymentStatus === "paid") {
    return (
      <span className="text-[10px] bg-green-50 text-green-700 px-2 py-[2px] font-semibold tracking-wider">
        已付款
      </span>
    );
  }
  return (
    <span className="text-[10px] bg-brand-accent/20 text-brand-dark px-2 py-[2px] font-semibold tracking-wider">
      {STATUS_LABEL[paymentStatus] ?? "已確認"}
    </span>
  );
}
