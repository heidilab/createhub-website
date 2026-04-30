"use client";

import { useMemo, useState } from "react";
import { Search, Shield, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Member {
  uid: string;
  email: string;
  fullName: string;
  whatsapp: string;
  role: "member" | "admin";
  registrationCount: number;
  createdAtMs: number;
}

function formatDate(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return members;
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(term) ||
        m.fullName.toLowerCase().includes(term) ||
        m.whatsapp.toLowerCase().includes(term)
    );
  }, [q, members]);

  const toggleRole = async (uid: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "member" : "admin";
    const name = members.find((m) => m.uid === uid)?.fullName || uid;
    if (
      !confirm(
        nextRole === "admin"
          ? `將 ${name} 設為管理員？將獲得後台管理權限。`
          : `將 ${name} 由管理員降級為普通會員？`
      )
    )
      return;

    setBusy(uid);
    try {
      const res = await fetch("/api/admin/members/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, role: nextRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "操作失敗");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 bg-white border border-brand-hair px-3 py-2 mb-5 max-w-md">
        <Search className="w-4 h-4 text-brand-softer" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋姓名、電郵或 WhatsApp"
          className="flex-1 text-[13px] outline-none placeholder:text-brand-softer"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white border border-brand-hair overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-brand-bg border-b border-brand-hair">
              <tr className="text-left">
                <Th>姓名</Th>
                <Th>電郵</Th>
                <Th>WhatsApp</Th>
                <Th>角色</Th>
                <Th>報名數</Th>
                <Th>加入日期</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-hair">
              {filtered.map((m) => (
                <tr key={m.uid} className="hover:bg-brand-bg/40">
                  <td className="p-3 font-medium text-brand-text">
                    {m.fullName || "—"}
                  </td>
                  <td className="p-3 text-brand-muted">{m.email}</td>
                  <td className="p-3 text-brand-muted">{m.whatsapp || "—"}</td>
                  <td className="p-3">
                    {m.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-brand-dark text-white px-2 py-[2px] font-semibold tracking-wider">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        ADMIN
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-softer tracking-wider">
                        MEMBER
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-serif text-[15px] font-bold text-brand-dark">
                    {m.registrationCount}
                  </td>
                  <td className="p-3 text-brand-softer">
                    {formatDate(m.createdAtMs)}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleRole(m.uid, m.role)}
                      disabled={busy === m.uid}
                      className="inline-flex items-center gap-1 text-[12px] text-brand-accent hover:text-brand-dark disabled:opacity-50"
                    >
                      <Shield className="w-3 h-3" />
                      {busy === m.uid
                        ? "處理中…"
                        : m.role === "admin"
                        ? "降為會員"
                        : "設為 Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-brand-hair p-10 text-center text-[13px] text-brand-softer">
          冇搵到對應嘅會員
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
