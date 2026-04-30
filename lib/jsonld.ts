import { SITE } from "@/lib/constants";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.createhub.biz";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.nameEn,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wan Chai",
      addressRegion: "Hong Kong",
      addressCountry: "HK",
    },
    sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.youtube],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE_URL,
    inLanguage: "zh-HK",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/events?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

interface EventSchemaInput {
  id: string;
  title: string;
  description?: string;
  eventDateIso: string;
  endDateIso?: string;
  location?: string;
  eventType: string;
  speakerName?: string;
  isFree: boolean;
  priceHkd: number;
  coverImage?: string;
}

export function eventJsonLd(e: EventSchemaInput) {
  const isOnline = e.eventType === "online";
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.description?.slice(0, 500),
    startDate: e.eventDateIso,
    endDate: e.endDateIso,
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : e.eventType === "hybrid"
      ? "https://schema.org/MixedEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: isOnline
      ? {
          "@type": "VirtualLocation",
          url: `${SITE_URL}/events/${e.id}`,
        }
      : {
          "@type": "Place",
          name: e.location || "Hong Kong",
          address: {
            "@type": "PostalAddress",
            addressLocality: e.location || "Hong Kong",
            addressCountry: "HK",
          },
        },
    image: e.coverImage ? [e.coverImage] : [`${SITE_URL}/opengraph-image`],
    organizer: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE_URL,
    },
    performer: e.speakerName
      ? {
          "@type": "Person",
          name: e.speakerName,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: e.isFree ? "0" : String(e.priceHkd),
      priceCurrency: "HKD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/events/${e.id}`,
    },
    url: `${SITE_URL}/events/${e.id}`,
  };
}

interface ArticleSchemaInput {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAtIso?: string;
  updatedAtIso?: string;
  coverImage?: string;
}

export function articleJsonLd(a: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    author: {
      "@type": "Person",
      name: a.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: a.publishedAtIso,
    dateModified: a.updatedAtIso || a.publishedAtIso,
    image: a.coverImage ? [a.coverImage] : [`${SITE_URL}/opengraph-image`],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/news/${a.slug}`,
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/venue`,
    name: SITE.venue.name,
    url: SITE.venue.url,
    telephone: SITE.venue.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.venue.address,
      addressLocality: "Lai Chi Kok",
      addressRegion: "Kowloon",
      addressCountry: "HK",
    },
    description:
      "Commercial event venue rental in Lai Chi Kok, Hong Kong. 1,200+ sqft private space suitable for training, workshops, seminars, webinars, and video production.",
  };
}
