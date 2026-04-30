// Fetches recent videos from a YouTube channel via RSS feed — NO API key required.
// YouTube RSS returns ~15 most recent videos.
// Docs: https://www.youtube.com/feeds/videos.xml?channel_id=<UC...>

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  author: string;
}

// 創研社 Create Hub — https://www.youtube.com/@CreateHub-hk
export const CHANNEL_ID = "UCpdqsHFDrtYl8YlviL2IrWg";
export const CHANNEL_HANDLE = "@CreateHub-hk";
export const CHANNEL_URL = `https://www.youtube.com/${CHANNEL_HANDLE}`;
export const SUBSCRIBE_URL = `${CHANNEL_URL}?sub_confirmation=1`;

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function extractEntries(xml: string): string[] {
  const entries: string[] = [];
  const re = /<entry>[\s\S]*?<\/entry>/g;
  const matches = xml.match(re);
  if (matches) entries.push(...matches);
  return entries;
}

function firstMatch(src: string, re: RegExp): string | null {
  const m = src.match(re);
  return m ? m[1] : null;
}

function parseEntry(entry: string): YouTubeVideo | null {
  const id = firstMatch(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
  const title = firstMatch(entry, /<title>([^<]+)<\/title>/);
  const published = firstMatch(entry, /<published>([^<]+)<\/published>/);
  const author = firstMatch(entry, /<author>[\s\S]*?<name>([^<]+)<\/name>/);

  if (!id || !title) return null;

  // Always use canonical i.ytimg.com (feed may return i1/i2/i3/i4 regional mirrors)
  return {
    id,
    title: decode(title),
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: published || "",
    author: author ? decode(author) : "創研社 Create Hub",
  };
}

export async function getLatestVideos(limit = 4): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 }, // cache 1 hour
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!res.ok) throw new Error(`RSS feed returned ${res.status}`);
    const xml = await res.text();
    const entries = extractEntries(xml);
    return entries
      .map(parseEntry)
      .filter((v): v is YouTubeVideo => v !== null)
      .slice(0, limit);
  } catch (err) {
    console.warn("[YouTube RSS fetch failed]", err);
    return [];
  }
}
