import { adminDb } from "@/lib/firebase/admin";
import NewsletterComposer from "@/components/admin/NewsletterComposer";

export const dynamic = "force-dynamic";

export const metadata = { title: "Newsletter 管理" };

async function getStats() {
  const db = adminDb();
  try {
    const [subsSnap, newsletterUsersSnap] = await Promise.all([
      db
        .collection("newsletterSubscribers")
        .where("isActive", "==", true)
        .count()
        .get(),
      db
        .collection("users")
        .where("isNewsletterSubscribed", "==", true)
        .count()
        .get(),
    ]);

    return {
      publicSubscribers: subsSnap.data().count,
      memberSubscribers: newsletterUsersSnap.data().count,
    };
  } catch {
    return { publicSubscribers: 0, memberSubscribers: 0 };
  }
}

export default async function AdminNewsletterPage() {
  const stats = await getStats();
  const total = stats.publicSubscribers + stats.memberSubscribers;

  return (
    <div className="p-8 lg:p-12 max-w-4xl">
      <header className="mb-10 pb-5 border-b border-brand-hair">
        <div className="eyebrow-muted mb-3">Newsletter</div>
        <h1 className="font-serif text-[32px] text-brand-text">發送 Newsletter</h1>
        <p className="text-[13px] text-brand-softer mt-2">
          向訂閱者發送最新消息、活動通知
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 mb-10">
        <StatBox label="活躍訂閱者" value={total} accent />
        <StatBox label="公開訂閱" value={stats.publicSubscribers} />
        <StatBox label="會員訂閱" value={stats.memberSubscribers} />
      </section>

      <NewsletterComposer totalRecipients={total} />
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-5 border ${
        accent
          ? "bg-brand-dark text-white border-brand-dark"
          : "bg-white border-brand-hair"
      }`}
    >
      <div
        className={`text-[10px] tracking-[0.2em] uppercase font-semibold mb-2 ${
          accent ? "text-brand-accent" : "text-brand-softer"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-serif text-[30px] leading-none ${
          accent ? "text-white" : "text-brand-text"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
