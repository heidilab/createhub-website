import Link from "next/link";
import { CheckCircle2, Mail, CalendarCheck } from "lucide-react";
import { getEventById } from "@/lib/events";
import { formatEventDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export const metadata = { title: "報名成功" };

export default async function EventSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventById(params.id);

  return (
    <div className="container-narrow px-5 py-16 lg:py-24 max-w-2xl">
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-accent/15 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-brand-dark" />
        </div>
        <div className="eyebrow mb-3">Payment Successful</div>
        <div className="rule-accent mx-auto mb-5" />
        <h1 className="font-serif text-[36px] sm:text-[44px] text-brand-text leading-tight mb-4">
          報名 + 付款成功
        </h1>
        <p className="text-[14px] text-brand-muted leading-[1.9] max-w-lg mx-auto">
          多謝你嘅報名！確認信已寄到你嘅電郵，請到 inbox 查看活動詳情同入場指引。
        </p>
      </div>

      {event && (
        <div className="bg-white border border-brand-hair p-6 lg:p-8 mb-8">
          <div className="eyebrow-muted mb-3">你報名嘅活動</div>
          <div className="rule-accent mb-5" />
          <h2 className="font-serif text-[22px] lg:text-[26px] text-brand-text leading-snug mb-4">
            {event.title}
          </h2>
          <div className="space-y-2.5 text-[13px] text-brand-muted">
            <div className="flex gap-3">
              <span className="text-[11px] text-brand-softer tracking-[0.15em] uppercase w-16 pt-0.5">
                日期
              </span>
              <span className="text-brand-text">
                {formatEventDate(event.eventDate)}
              </span>
            </div>
            {event.speakerName && (
              <div className="flex gap-3">
                <span className="text-[11px] text-brand-softer tracking-[0.15em] uppercase w-16 pt-0.5">
                  講師
                </span>
                <span className="text-brand-text">{event.speakerName}</span>
              </div>
            )}
            {event.eventType === "online" ? (
              <div className="flex gap-3">
                <span className="text-[11px] text-brand-softer tracking-[0.15em] uppercase w-16 pt-0.5">
                  形式
                </span>
                <span className="text-brand-text">
                  線上（Zoom 連結見報名確認信）
                </span>
              </div>
            ) : (
              event.location && (
                <div className="flex gap-3">
                  <span className="text-[11px] text-brand-softer tracking-[0.15em] uppercase w-16 pt-0.5">
                    地點
                  </span>
                  <span className="text-brand-text">{event.location}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="bg-brand-bg border border-brand-hair p-5 mb-8 flex items-start gap-3">
        <Mail className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
        <div className="text-[12px] text-brand-muted leading-relaxed">
          確認信大約 1-2 分鐘內送達，如果冇收到請檢查垃圾郵件。如有疑問請聯絡{" "}
          <a href="mailto:info@createhub.biz" className="text-brand-accent underline">
            info@createhub.biz
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/dashboard" className="btn-primary">
          <CalendarCheck className="w-4 h-4" />
          查看會員中心
        </Link>
        <Link href="/events" className="btn-secondary-link">
          瀏覽更多活動
        </Link>
      </div>
    </div>
  );
}
