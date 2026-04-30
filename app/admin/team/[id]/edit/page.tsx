import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { serializeDate } from "@/lib/serialize";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import type { TeamMember } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "編輯團隊成員" };

async function getTeamMember(id: string): Promise<TeamMember | null> {
  if (id === "new") return null;
  try {
    const snap = await adminDb().collection("teamMembers").doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data() ?? {};
    return {
      id: snap.id,
      name: data.name ?? "",
      nameEn: data.nameEn ?? undefined,
      title: data.title ?? "",
      bio: data.bio ?? undefined,
      photoUrl: data.photoUrl ?? undefined,
      orderIndex: data.orderIndex ?? 99,
      isVisible: data.isVisible ?? true,
      createdAt: serializeDate(data.createdAt) ?? undefined,
      updatedAt: serializeDate(data.updatedAt) ?? undefined,
    };
  } catch {
    return null;
  }
}

export default async function EditTeamMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "new";
  const member = isNew ? null : await getTeamMember(params.id);
  if (!isNew && !member) notFound();

  return (
    <div className="p-8 lg:p-12 max-w-3xl">
      <Link
        href="/admin/team"
        className="inline-flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-dark mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        返回團隊列表
      </Link>

      <header className="mb-10 pb-5 border-b border-brand-hair">
        <div className="eyebrow-muted mb-3">
          {isNew ? "New Member" : "Edit Member"}
        </div>
        <h1 className="font-serif text-[32px] text-brand-text">
          {isNew ? "新增團隊成員" : "編輯團隊成員"}
        </h1>
      </header>

      <TeamMemberForm
        mode={isNew ? "create" : "edit"}
        initial={member ?? undefined}
      />
    </div>
  );
}
