import { adminDb } from "@/lib/firebase/admin";
import { serializeDate } from "@/lib/serialize";
import type { Event } from "@/types";

function docToEvent(doc: FirebaseFirestore.DocumentSnapshot): Event {
  const data = doc.data()!;
  return {
    id: doc.id,
    title: data.title ?? "",
    slug: data.slug ?? doc.id,
    description: data.description ?? "",
    coverImage: data.coverImage ?? undefined,
    eventType: data.eventType ?? "offline",
    category: data.category ?? "lecture",
    speakerName: data.speakerName ?? undefined,
    speakerBio: data.speakerBio ?? undefined,
    eventDate: serializeDate(data.eventDate) ?? "",
    endDate: serializeDate(data.endDate) ?? undefined,
    location: data.location ?? undefined,
    zoomLink: data.zoomLink ?? undefined,
    isFree: data.isFree ?? true,
    priceHkd: data.priceHkd ?? 0,
    capacity: data.capacity ?? undefined,
    status: data.status ?? "upcoming",
    isPublished: data.isPublished ?? false,
    registrationCount: data.registrationCount ?? undefined,
    createdAt: serializeDate(data.createdAt) ?? undefined,
    updatedAt: serializeDate(data.updatedAt) ?? undefined,
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
      q = q.where("eventDate", ">=", now).orderBy("eventDate", "asc");
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
