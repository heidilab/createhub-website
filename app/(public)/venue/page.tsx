import Image from "next/image";
import { existsSync } from "fs";
import path from "path";
import {
  ArrowRight,
  MapPin,
  Users2,
  Video,
  Presentation,
  GraduationCap,
  Mic,
  Tv2,
  Handshake,
  ExternalLink,
  Navigation,
  ImageIcon,
} from "lucide-react";
import { SITE } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/jsonld";

export const metadata = {
  title: "場地租用",
  description:
    "創研社合作場地 Link Hub，荔枝角 1,200+ 呎獨立商業活動空間，容納最多 80 人。可租用作課程、工作坊、講座、Webinar 直播、YouTube 拍攝等。",
};

const USE_CASES = [
  {
    icon: GraduationCap,
    title: "企業培訓 / 課程",
    desc: "固定桌椅設置，適合長時間培訓、工作坊或課程。",
  },
  {
    icon: Presentation,
    title: "講座 / 研討會",
    desc: "劇院式座位安排，可容納最多 80 位參加者。",
  },
  {
    icon: Mic,
    title: "社群活動 / 交流會",
    desc: "彈性空間配搭，適合 networking 同 panel discussion。",
  },
  {
    icon: Video,
    title: "Webinar / 線上直播",
    desc: "專業燈光 + 穩定網絡，助你做高質素線上內容。",
  },
  {
    icon: Tv2,
    title: "YouTube / 訪談拍攝",
    desc: "拍攝設備租賃，帶燈光配合創作者需要。",
  },
  {
    icon: Handshake,
    title: "帶貨直播 / Broadcast",
    desc: "品牌內容、電商直播、產品發布適用。",
  },
];

const PRICING = [
  {
    label: "一般場地租用",
    price: "HK$650",
    unit: "每小時起",
    note: "按時段及用途浮動",
  },
  {
    label: "NGO / 非牟利優惠",
    price: "HK$500",
    unit: "每小時起",
    note: "需提供認證證明",
  },
  {
    label: "拍攝租賃（連燈光）",
    price: "HK$780",
    unit: "每小時起",
    note: "適合影片 / 直播製作",
  },
];

// Accept either .jpg, .jpeg, .png or .webp
function resolveVenuePhoto(): string | null {
  const candidates = [
    "venue-photo.jpg",
    "venue-photo.jpeg",
    "venue-photo.png",
    "venue-photo.webp",
  ];
  for (const filename of candidates) {
    if (existsSync(path.join(process.cwd(), "public", filename))) {
      return `/${filename}`;
    }
  }
  return null;
}
const VENUE_PHOTO = resolveVenuePhoto();
const venuePhotoExists = VENUE_PHOTO !== null;

export default function VenuePage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[18vw] lg:text-[18rem] leading-none whitespace-nowrap"
          >
            VENUE
          </h2>
        </div>
        <div className="relative container-wide px-5 lg:px-8 py-20 lg:py-28">
          <div className="pill-tag inline-flex mb-6">
            <MapPin className="w-3 h-3 mr-1.5 text-brand-accent" />
            Commercial Venue Rental
          </div>
          <h1 className="font-serif text-[48px] sm:text-[62px] lg:text-[80px] leading-[1.05] text-brand-text mb-7 max-w-4xl">
            專業商業活動
            <br />
            <em className="not-italic font-semibold text-brand-dark">
              <span className="italic font-serif">場</span>地租用
            </em>
          </h1>
          <p className="text-[15px] lg:text-[17px] text-brand-muted leading-[1.95] max-w-2xl mb-10">
            荔枝角核心地段，1,200+ 呎獨立商業空間，配備完善燈光設備，支援課堂、工作坊、講座、Webinar 直播、YouTube 拍攝等多元用途。
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={SITE.venue.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-primary"
            >
              WhatsApp 查詢
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={SITE.venue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-outline"
            >
              訪問場地網站
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Key specs strip — glass cards */}
      <section className="gradient-soft py-12 lg:py-16">
        <div className="container-wide px-5 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          <Spec num="80" unit="人" label="講座模式容量" />
          <Spec num="60" unit="人" label="工作坊容量" />
          <Spec num="1,200" unit="呎+" label="獨立私人空間" />
          <Spec num="2" unit="分鐘" label="荔枝角港鐵步程" />
        </div>
      </section>

      {/* Use cases — glass grid */}
      <section className="gradient-soft py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[14vw] lg:text-[12rem] leading-none whitespace-nowrap"
          >
            USE&nbsp;CASES
          </h2>
        </div>

        <div className="relative container-wide px-5 lg:px-8">
          <div className="text-center mb-12 lg:mb-14">
            <div className="pill-tag inline-flex mb-5">What You Can Do</div>
            <h2 className="font-serif text-[34px] sm:text-[42px] lg:text-[52px] text-brand-text leading-tight mb-4">
              適合多元商業用途
            </h2>
            <p className="text-[14px] lg:text-[15px] text-brand-muted leading-[1.9] max-w-2xl mx-auto">
              由企業培訓到短影片拍攝，場地彈性滿足你嘅不同需求。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="glass-card rounded-3xl p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 flex items-center justify-center text-brand-dark mb-5 group-hover:bg-brand-accent group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-[22px] text-brand-text mb-3">
                    {c.title}
                  </h3>
                  <p className="text-[13px] text-brand-softer leading-[1.85]">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Venue Photo + Location */}
      <section className="gradient-soft py-16 lg:py-24">
        <div className="container-wide px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 lg:p-10">
            <div className="pill-tag inline-flex mb-5">
              <MapPin className="w-3 h-3 mr-1.5 text-brand-accent" />
              Location
            </div>
            <h2 className="font-serif text-[28px] lg:text-[36px] text-brand-text leading-tight mb-5">
              荔枝角核心地段
            </h2>
            <p className="text-[14px] text-brand-muted leading-[1.95] mb-6">
              位於九龍荔枝角永康街工業大廈，鄰近荔枝角港鐵站（步行約 2 分鐘），交通便利。
            </p>
            <div className="flex items-start gap-2.5 pb-4 mb-4 border-b border-brand-hair">
              <MapPin className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
              <div className="text-[14px] text-brand-text">
                {SITE.venue.address}
              </div>
            </div>
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-brand-hair">
              <Users2 className="w-4 h-4 text-brand-accent flex-shrink-0" />
              <div className="text-[13px] text-brand-muted">
                由 <span className="font-semibold text-brand-dark">Link Hub</span>{" "}
                （Create Hub Limited 旗下）管理
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=%E6%B0%B8%E5%BA%B7%E8%A1%9729-33%E8%99%9F%E5%85%86%E5%A8%81%E5%B7%A5%E6%A5%AD%E5%A4%A7%E5%BB%88"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-outline"
            >
              <Navigation className="w-3.5 h-3.5" />
              Google Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-card rounded-3xl overflow-hidden p-2">
              <div className="aspect-[4/3] relative bg-gradient-to-br from-brand-light/40 via-brand-bg to-brand-accent/15 rounded-2xl overflow-hidden">
                {venuePhotoExists && VENUE_PHOTO ? (
                  <Image
                    src={VENUE_PHOTO}
                    alt="Link Hub 場地實景 — 荔枝角商業活動空間"
                    fill
                    sizes="(max-width: 1024px) 100vw, 720px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-dark/30">
                    <ImageIcon className="w-16 h-16 mb-3" strokeWidth={1.2} />
                    <div className="font-serif text-[20px] mb-1">
                      Link Hub Venue
                    </div>
                    <div className="text-[11px] tracking-[0.2em] uppercase text-brand-softer/60">
                      實景相片載入中
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-[11px] text-brand-softer tracking-[0.2em] uppercase mt-4 text-center font-semibold">
              Venue Photo · Link Hub
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — glass cards */}
      <section className="py-16 lg:py-24 relative overflow-hidden gradient-soft">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h2
            aria-hidden="true"
            className="watermark-text text-[14vw] lg:text-[14rem] leading-none whitespace-nowrap"
          >
            PRICING
          </h2>
        </div>

        <div className="relative container-wide px-5 lg:px-8">
          <div className="text-center mb-12">
            <div className="pill-tag inline-flex mb-5">Flexible Rates</div>
            <h2 className="font-serif text-[34px] sm:text-[42px] lg:text-[52px] text-brand-text leading-tight mb-4">
              彈性租金
            </h2>
            <p className="text-[14px] text-brand-muted leading-[1.9] max-w-2xl mx-auto">
              租金按時段、用途及使用人數浮動，請聯絡我哋獲取最新報價。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {PRICING.map((p, idx) => (
              <div
                key={p.label}
                className={`glass-card rounded-3xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                  idx === 1 ? "lg:scale-[1.03] lg:bg-white/85" : ""
                }`}
              >
                <div className="pill-tag inline-flex mb-5">{p.label}</div>
                <div className="font-outfit text-[44px] lg:text-[52px] font-black text-brand-dark leading-none mb-1">
                  {p.price}
                </div>
                <div className="text-[11px] text-brand-accent tracking-[0.15em] uppercase font-bold mb-4">
                  {p.unit}
                </div>
                <div className="text-[12px] text-brand-muted leading-relaxed pt-4 border-t border-brand-hair">
                  {p.note}
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card-dark rounded-3xl p-7 text-center max-w-3xl mx-auto">
            <div
              className="pill-tag-accent inline-flex mb-3"
              style={{ background: "rgba(52, 204, 239, 0.18)", color: "#a8eaf7" }}
            >
              Community Support Program
            </div>
            <h3 className="font-serif text-[22px] text-white mb-2">
              NGO 免費資助計劃
            </h3>
            <p className="text-[13px] text-white/80 leading-[1.85]">
              Link Hub 每月揀選合資格非牟利機構，提供免場地費資助。有興趣嘅機構可以電郵申請。
            </p>
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="bg-brand-dark text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #34ccef 0%, transparent 50%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="font-outfit font-black uppercase text-[18vw] lg:text-[14rem] leading-none whitespace-nowrap"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(52, 204, 239, 0.08)",
            }}
            aria-hidden="true"
          >
            BOOK&nbsp;NOW
          </div>
        </div>

        <div className="relative container-narrow px-5 py-20 lg:py-28 text-center">
          <div
            className="pill-tag-accent inline-flex mb-6"
            style={{ background: "rgba(52, 204, 239, 0.15)", color: "#a8eaf7" }}
          >
            Ready to Book?
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] lg:text-[56px] text-white leading-tight mb-5">
            預約參觀 / 查詢場地
          </h2>
          <p className="text-[14px] lg:text-[16px] text-white/75 leading-relaxed max-w-xl mx-auto mb-10">
            WhatsApp 我哋查詢空檔期、報價及場地參觀，專人為你度身安排。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href={SITE.venue.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-accent"
            >
              WhatsApp +852 9691 6190
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={SITE.venue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn-outline"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              訪問 Link Hub 官網
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Spec({
  num,
  unit,
  label,
}: {
  num: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="glass-card rounded-2xl py-6 px-4 text-center">
      <div className="font-outfit text-[32px] lg:text-[44px] font-black text-brand-dark leading-none mb-1">
        {num}
        <span className="text-[16px] lg:text-[20px] text-brand-accent ml-1">
          {unit}
        </span>
      </div>
      <div className="text-[10px] text-brand-softer tracking-[0.15em] uppercase mt-2 font-semibold">
        {label}
      </div>
    </div>
  );
}
