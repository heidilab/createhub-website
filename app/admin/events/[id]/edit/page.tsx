import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/events";
import EventForm from "@/components/admin/EventForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "編輯活動" };

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventById(params.id);
  if (!event) notFound();

  return (
    <div className="p-8 lg:p-12 max-w-3xl">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-[12px] text-brand-muted hover:text-brand-dark mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        返回活動列表
      </Link>

      <header className="mb-10 pb-5 border-b border-brand-hair">
        <div className="eyebrow-muted mb-3">Edit Event</div>
        <h1 className="font-serif text-[32px] text-brand-text">編輯活動</h1>
        <p className="text-[13px] text-brand-softer mt-2">
          活動 ID：<code className="bg-brand-bg px-1.5 py-0.5 text-[11px]">{event.id}</code>
        </p>
      </header>

      <EventForm mode="edit" initial={event} />
    </div>
  );
}
