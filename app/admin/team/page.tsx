import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Eye, EyeOff } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import type { TeamMember } from "@/types";

export const dynamic = "force-dynamic";

async function getAllTeamMembers(): Promise<TeamMember[]> {
  try {
    const snap = await adminDb()
      .collection("teamMembers")
      .orderBy("orderIndex", "asc")
      .get();
    return snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<TeamMember, "id">) } as TeamMember)
    );
  } catch {
    return [];
  }
}

export default async function AdminTeamPage() {
  const members = await getAllTeamMembers();

  return (
    <div className="p-8 lg:p-12">
      <header className="flex items-end justify-between mb-10 pb-5 border-b border-brand-hair">
        <div>
          <div className="eyebrow-muted mb-3">Team</div>
          <h1 className="font-serif text-[32px] text-brand-text">團隊管理</h1>
          <p className="text-[13px] text-brand-softer mt-2">
            管理創辦人 / 團隊成員資料、排序、顯示狀態
          </p>
        </div>
        <Link
          href="/admin/team/new/edit"
          className="inline-flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 text-[13px] font-bold tracking-wide hover:bg-brand-text transition"
        >
          <Plus className="w-4 h-4" />
          新增成員
        </Link>
      </header>

      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/admin/team/${m.id}/edit`}
              className="bg-white border border-brand-hair hover:border-brand-accent transition group"
            >
              <div className="aspect-[4/5] relative bg-brand-bg overflow-hidden">
                {m.photoUrl ? (
                  <Image
                    src={m.photoUrl}
                    alt={m.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-5xl text-brand-dark/20">
                      {m.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-white/95 text-[10px] font-semibold text-brand-dark px-2 py-[2px]">
                    #{m.orderIndex}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  {m.isVisible ? (
                    <span className="bg-brand-accent/90 text-white text-[10px] font-semibold px-2 py-[2px] inline-flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" /> 顯示
                    </span>
                  ) : (
                    <span className="bg-brand-softer/90 text-white text-[10px] font-semibold px-2 py-[2px] inline-flex items-center gap-1">
                      <EyeOff className="w-2.5 h-2.5" /> 隱藏
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="font-serif text-[18px] text-brand-text mb-1">
                  {m.name}
                </div>
                <div className="text-[11px] text-brand-softer mb-3">
                  {m.title}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-brand-accent font-semibold">
                  <Edit2 className="w-3 h-3" /> 編輯
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-brand-rule p-16 text-center">
          <div className="eyebrow-muted mb-3">No Members</div>
          <div className="rule-accent mx-auto mb-5" />
          <h2 className="font-serif text-[24px] text-brand-text mb-3">
            未有團隊成員
          </h2>
          <p className="text-[13px] text-brand-softer mb-6 max-w-sm mx-auto">
            新增創辦人或團隊成員資料，會顯示喺「關於我們」頁面
          </p>
          <Link href="/admin/team/new/edit" className="btn-primary">
            <Plus className="w-4 h-4" />
            新增成員
          </Link>
        </div>
      )}
    </div>
  );
}
