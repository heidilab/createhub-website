import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/articles";
import { getPublishedEvents } from "@/lib/events";
import { toDate } from "@/lib/date";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.createhub.biz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/events`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${SITE_URL}/about`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/venue`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/register`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE_URL}/login`, lastModified: now, priority: 0.3, changeFrequency: "monthly" },
  ];

  const [events, articles] = await Promise.all([
    getPublishedEvents(),
    getPublishedArticles(),
  ]);

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}/events/${e.id}`,
    lastModified: toDate(e.updatedAt ?? e.eventDate) ?? now,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const articleRoutes: MetadataRoute.Sitemap = [];
  if (articles.length > 0) {
    articleRoutes.push({
      url: `${SITE_URL}/news`,
      lastModified: now,
      priority: 0.8,
      changeFrequency: "weekly",
    });
    articles.forEach((a) => {
      articleRoutes.push({
        url: `${SITE_URL}/news/${a.slug}`,
        lastModified: toDate(a.updatedAt ?? a.publishedAt) ?? now,
        priority: 0.7,
        changeFrequency: "monthly",
      });
    });
  }

  return [...staticRoutes, ...eventRoutes, ...articleRoutes];
}
