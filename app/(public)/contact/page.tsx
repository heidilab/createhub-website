import ContactForm from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "聯絡我們",
  description: "有任何課程、活動查詢，歡迎聯絡創研社 CREATE HUB。",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[18vw] lg:text-[16rem] leading-none whitespace-nowrap"
          >
            CONTACT
          </h2>
        </div>
        <div className="relative container-wide px-5 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="pill-tag mb-6">
              <Send className="w-3 h-3 mr-1.5 text-brand-accent" />
              Get in Touch
            </div>
            <h1 className="font-serif text-[48px] sm:text-[64px] lg:text-[80px] leading-[1.0] text-brand-text mb-6">
              聯絡我們
            </h1>
            <p className="text-[15px] lg:text-[17px] text-brand-muted leading-[1.95] max-w-2xl">
              有任何課程查詢、活動合作或其他問題，歡迎透過以下方式聯絡我哋。
            </p>
          </div>
        </div>
      </section>

      <section className="gradient-soft py-14 lg:py-20">
        <div className="container-wide px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — info */}
          <aside className="lg:col-span-2 space-y-4">
            <ContactInfo
              icon={<Phone className="w-4 h-4" />}
              label="電話"
              value={SITE.phone}
              href={`tel:${SITE.phone}`}
            />
            <ContactInfo
              icon={<Mail className="w-4 h-4" />}
              label="電郵"
              value={SITE.email}
              href={`mailto:${SITE.email}`}
            />
            <ContactInfo
              icon={<MessageCircle className="w-4 h-4" />}
              label="WhatsApp"
              value={SITE.phone}
              href={SITE.social.whatsapp}
            />
            <ContactInfo
              icon={<MapPin className="w-4 h-4" />}
              label="地址"
              value={SITE.address}
            />

            <div className="glass-card-dark rounded-3xl p-7 mt-6">
              <div
                className="pill-tag-accent inline-flex mb-4"
                style={{ background: "rgba(52, 204, 239, 0.18)", color: "#a8eaf7" }}
              >
                Office Hours
              </div>
              <div className="space-y-2 text-[13px] text-white/85">
                <div className="flex justify-between">
                  <span>星期一至五</span>
                  <span className="font-semibold">10:00 — 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>星期六</span>
                  <span className="font-semibold">10:00 — 17:00</span>
                </div>
                <div className="flex justify-between text-white/55">
                  <span>星期日 / 公眾假期</span>
                  <span>休息</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-3xl p-7 lg:p-10">
              <div className="pill-tag-accent inline-flex mb-4">
                Send a Message
              </div>
              <h2 className="font-serif text-[28px] lg:text-[34px] text-brand-text mb-3">
                留言查詢
              </h2>
              <p className="text-[13px] text-brand-softer mb-8">
                我哋會喺兩個工作天內回覆。
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactInfo({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="glass-card rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-1.5 text-[10px] text-brand-softer tracking-[0.2em] uppercase mb-2.5">
        <span className="text-brand-accent">{icon}</span>
        {label}
      </div>
      <div className="text-[15px] text-brand-text font-medium">{value}</div>
    </div>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="block hover:text-brand-accent transition"
    >
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}
