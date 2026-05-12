import { adminDb } from "@/lib/firebase/admin";
import { serializeDate } from "@/lib/serialize";
import type { Event, EventSession, Speaker } from "@/types";

function normalizeSpeakers(data: FirebaseFirestore.DocumentData): Speaker[] {
  if (Array.isArray(data.speakers) && data.speakers.length > 0) {
    return data.speakers
      .filter((s: unknown): s is Record<string, unknown> => !!s && typeof s === "object")
      .map((s: Record<string, unknown>) => ({
        name: (s.name as string) ?? "",
        bio: (s.bio as string) ?? undefined,
        photoUrl: (s.photoUrl as string) ?? undefined,
      }))
      .filter((s: Speaker) => s.name.length > 0);
  }
  if (data.speakerName) {
    return [
      {
        name: data.speakerName,
        bio: data.speakerBio ?? undefined,
      },
    ];
  }
  return [];
}

function normalizeSpeakerEmails(data: FirebaseFirestore.DocumentData): string[] {
  if (Array.isArray(data.speakerEmails)) {
    return data.speakerEmails
      .filter((e: unknown): e is string => typeof e === "string")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
  }
  return [];
}

function normalizeSessions(data: FirebaseFirestore.DocumentData): EventSession[] {
  if (Array.isArray(data.sessions) && data.sessions.length > 0) {
    return data.sessions
      .filter((s: unknown): s is Record<string, unknown> => !!s && typeof s === "object")
      .map((s: Record<string, unknown>, idx: number) => ({
        id: (s.id as string) || `session-${idx + 1}`,
        startDate: serializeDate(s.startDate) ?? "",
        endDate: serializeDate(s.endDate) ?? undefined,
        location: (s.location as string) ?? undefined,
        zoomLink: (s.zoomLink as string) ?? undefined,
        capacity:
          typeof s.capacity === "number" && s.capacity > 0
            ? s.capacity
            : undefined,
      }))
      .filter((s: EventSession) => s.startDate);
  }
  // Back-compat: synthesize a single session from flat fields.
  if (data.eventDate) {
    return [
      {
        id: "default",
        startDate: serializeDate(data.eventDate) ?? "",
        endDate: serializeDate(data.endDate) ?? undefined,
        location: data.location ?? undefined,
        zoomLink: data.zoomLink ?? undefined,
        capacity:
          typeof data.capacity === "number" && data.capacity > 0
            ? data.capacity
            : undefined,
      },
    ];
  }
  return [];
}

function docToEvent(doc: FirebaseFirestore.DocumentSnapshot): Event {
  const data = doc.data()!;
  const sessions = normalizeSessions(data);
  const speakers = normalizeSpeakers(data);
  const speakerEmails = normalizeSpeakerEmails(data);
  const firstSession = sessions[0];

  return {
    id: doc.id,
    title: data.title ?? "",
    slug: data.slug ?? doc.id,
    description: data.description ?? "",
    coverImage: data.coverImage ?? undefined,
    eventType: data.eventType ?? "offline",
    category: data.category ?? "lecture",
    speakers,
    speakerEmails,
    sessions,
    // Mirrored "primary" fields — derived from first session, kept for sort/query compat.
    eventDate: firstSession?.startDate ?? serializeDate(data.eventDate) ?? "",
    endDate: firstSession?.endDate ?? serializeDate(data.endDate) ?? undefined,
    location: firstSession?.location ?? data.location ?? undefined,
    zoomLink: firstSession?.zoomLink ?? data.zoomLink ?? undefined,
    capacity: firstSession?.capacity ?? data.capacity ?? undefined,
    isFree: data.isFree ?? true,
    priceHkd: data.priceHkd ?? 0,
    status: data.status ?? "upcoming",
    isPublished: data.isPublished ?? false,
    registrationCount: data.registrationCount ?? undefined,
    createdAt: serializeDate(data.createdAt) ?? undefined,
    updatedAt: serializeDate(data.updatedAt) ?? undefined,
    // Legacy mirrors (read-only, surfaced for any callers still using them)
    speakerName: speakers[0]?.name,
    speakerBio: speakers[0]?.bio,
  };
}

export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  try {
    const now = new Date();
    const snap = await adminDb()
      .collection("events")
      .where("isPublished", "==", true)
      .where("status", "==", "upcoming")
      .where("eventDate", ">=", now)
      .orderBy("eventDate", "asc")
      .limit(limit)
      .get();
    return snap.docs.map(docToEvent);
  } catch (err) {
    console.warn("[getUpcomingEvents] Firestore not ready:", err);
    return [];
  }
}

export async function getPublishedEvents(opts?: {
  status?: "upcoming" | "past";
  eventType?: string;
  category?: string;
}): Promise<Event[]> {
  try {
    let q: FirebaseFirestore.Query = adminDb()
      .collection("events")
      .where("isPublished", "==", true);

    const now = new Date();
    if (opts?.status === "upcoming") {
      // Filter by status too so we reuse the existing
      // (isPublished + status + eventDate ASC) composite index
      // and exclude cancelled events that haven't passed yet.
      q = q
        .where("status", "==", "upcoming")
        .where("eventDate", ">=", now)
        .orderBy("eventDate", "asc");
    } else if (opts?.status === "past") {
      q = q.where("eventDate", "<", now).orderBy("eventDate", "desc");
    } else {
      q = q.orderBy("eventDate", "desc");
    }

    const snap = await q.get();
    let events = snap.docs.map(docToEvent);

    if (opts?.eventType && opts.eventType !== "all") {
      events = events.filter((e) => e.eventType === opts.eventType);
    }
    if (opts?.category && opts.category !== "all") {
      events = events.filter((e) => e.category === opts.category);
    }
    return events;
  } catch (err) {
    console.warn("[getPublishedEvents] Firestore not ready:", err);
    return [];
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const snap = await adminDb().collection("events").doc(id).get();
    if (!snap.exists) return null;
    return docToEvent(snap);
  } catch (err) {
    console.warn("[getEventById] Firestore not ready:", err);
    return null;
  }
}

export function findSession(
  event: Event,
  sessionId: string | null | undefined
): EventSession | null {
  if (!sessionId) return event.sessions[0] ?? null;
  return event.sessions.find((s) => s.id === sessionId) ?? null;
}
