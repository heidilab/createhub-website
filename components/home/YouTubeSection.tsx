import Image from "next/image";
import { Youtube, Play, ArrowRight } from "lucide-react";
import { getLatestVideos, CHANNEL_URL, SUBSCRIBE_URL } from "@/lib/youtube";

export default async function YouTubeSection() {
  const videos = await getLatestVideos(4);

  // Fallback: if RSS failed or channel has no videos
  if (videos.length === 0) {
    return (
      <section className="section-divider bg-white">
        <div className="container-wide px-5 lg:px-8 py-16 lg:py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#ff0000] flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div className="eyebrow-muted">YouTube Channel</div>
          </div>
          <div className="rule-accent mx-auto mb-5" />
          <h2 className="font-serif text-[30px] lg:text-[40px] text-brand-text leading-tight mb-4">
            創研社 YouTube 頻道
          </h2>
          <p className="text-[14px] text-brand-muted max-w-xl mx-auto mb-8">
            觀看完整嘅活動回放、講師訪談、商業個案分析影片。
          </p>
          <a
            href={SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#ff0000] text-white px-7 py-3 text-[13px] font-bold tracking-wide hover:bg-[#cc0000] transition"
          >
            <Youtube className="w-4 h-4" />
            訂閱頻道
          </a>
        </div>
      </section>
    );
  }

  const [featured, ...rest] = videos;
  const sideVideos = rest.slice(0, 3);

  return (
    <section className="section-divider bg-white">
      <div className="container-wide px-5 lg:px-8 py-16 lg:py-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10 pb-5 border-b border-brand-hair">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#ff0000] flex items-center justify-center">
                <Youtube className="w-4 h-4 text-white" />
              </div>
              <div className="eyebrow-muted">YouTube Channel</div>
            </div>
            <div className="rule-accent mb-4" />
            <h2 className="font-serif text-[30px] lg:text-[40px] text-brand-text leading-tight">
              最新影片
            </h2>
          </div>
          <a
            href={SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#ff0000] text-white px-5 py-2.5 text-[12px] font-bold tracking-wide hover:bg-[#cc0000] transition self-start"
          >
            <Youtube className="w-3.5 h-3.5" />
            訂閱頻道
          </a>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Featured embed — 2/3 */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video bg-brand-dark overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${featured.id}?rel=0&modestbranding=1`}
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
            <div className="mt-4">
              <div className="text-[10px] text-brand-accent tracking-[0.2em] uppercase font-semibold mb-1.5">
                Now Playing
              </div>
              <h3 className="font-serif text-[18px] lg:text-[20px] text-brand-text leading-snug">
                {featured.title}
              </h3>
            </div>
          </div>

          {/* Side thumbnails — 1/3 */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="eyebrow-muted mb-1">More Videos</div>
            {sideVideos.map((v) => (
              <a
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 items-start hover:bg-brand-bg transition p-2 -mx-2"
              >
                <div className="relative aspect-video w-[120px] flex-shrink-0 bg-brand-dark overflow-hidden">
                  <Image
                    src={v.thumbnailUrl}
                    alt={v.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-brand-text leading-snug line-clamp-3 group-hover:text-brand-accent transition-colors">
                    {v.title}
                  </div>
                </div>
              </a>
            ))}
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-accent border-b border-brand-accent pb-[1px] hover:text-brand-dark hover:border-brand-dark mt-2 self-start"
            >
              頻道所有影片 <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
