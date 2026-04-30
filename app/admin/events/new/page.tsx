import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EventForm from "@/components/admin/EventForm";

export const metadata = { title: "建立新活動" };

export default function NewEventPage() {
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
        <div className="eyebrow-muted mb-3">New Event</div>
        <h1 className="font-serif text-[32px] text-brand-text">建立新活動</h1>
      </header>

      <EventForm mode="create" />
    </div>
  );
}
