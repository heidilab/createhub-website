import { adminDb } from "@/lib/firebase/admin";
import MembersTable from "@/components/admin/MembersTable";
import type { UserProfile } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "會員管理" };

interface MemberRow extends UserProfile {
  registrationCount: number;
  createdAtMs: number;
}

async function getAllMembers(): Promise<MemberRow[]> {
  const db = adminDb();
  try {
    const snap = await db.collection("users").get();
    const members = snap.docs.map((d) => {
      const data = d.data();
      let createdAtMs = 0;
      if (data.createdAt?.toDate) {
        createdAtMs = data.createdAt.toDate().getTime();
      } else if (data.createdAt?.seconds) {
        createdAtMs = data.createdAt.seconds * 1000;
      }
      return {
        uid: d.id,
        email: data.email ?? "",
        fullName: data.fullName ?? "",
        whatsapp: data.whatsapp ?? "",
        role: (data.role ?? "member") as "member" | "admin",
        isNewsletterSubscribed: data.isNewsletterSubscribed ?? true,
        photoURL: data.photoURL,
        createdAtMs,
      } as Omit<MemberRow, "registrationCount">;
    });

    const withCounts: MemberRow[] = await Promise.all(
      members.map(async (m) => {
        let count = 0;
        try {
          const c = await db
            .collection("registrations")
            .where("userId", "==", m.uid)
            .count()
            .get();
          count = c.data().count;
        } catch {}
        return { ...m, registrationCount: count } as MemberRow;
      })
    );

    return withCounts.sort((a, b) => b.createdAtMs - a.createdAtMs);
  } catch (err) {
    console.warn("[admin members]", err);
    return [];
  }
}

export default async function AdminMembersPage() {
  const members = await getAllMembers();

  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10 pb-5 border-b border-brand-hair">
        <div className="eyebrow-muted mb-3">Members</div>
        <h1 className="font-serif text-[32px] text-brand-text">會員管理</h1>
        <p className="text-[13px] text-brand-softer mt-2">
          共 {members.length} 位會員
        </p>
      </header>

      <MembersTable
        members={members.map((m) => ({
          uid: m.uid,
          email: m.email,
          fullName: m.fullName,
          whatsapp: m.whatsapp ?? "",
          role: m.role,
          registrationCount: m.registrationCount,
          createdAtMs: m.createdAtMs,
        }))}
      />
    </div>
  );
}
