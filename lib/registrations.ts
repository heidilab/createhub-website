import { adminDb } from "@/lib/firebase/admin";
import type { Event, EventRegistration, EventSession } from "@/types";

type RegistrationWithEvent = EventRegistration & {
  event: Event | null;
  registeredSession: EventSession | null;
};

interface RawSessionShape {
  id?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  location?: string | null;
  zoomLink?: string | null;
  capacity?: number | null;
}

function resolveRegisteredSession(
  eventData: Record<string, unknown>,
  sessionId: string
): EventSession | null {
  const sessions = Array.isArray(eventData.sessions)
    ? (eventData.sessions as RawSessionShape[])
    : [];
  if (sessions.length > 0) {
    const found =
      sessions.find((s) => (s.id as string) === sessionId) ?? sessions[0];
    if (!found) return null;
    return {
      id: (found.id as string) || "default",
      startDate: found.startDate as EventSession["startDate"],
      endDate: found.endDate as EventSession["endDate"],
      location: (found.location as string | undefined) ?? undefined,
      zoomLink: (found.zoomLink as string | undefined) ?? undefined,
      capacity:
        typeof found.capacity === "number" && found.capacity > 0
          ? found.capacity
          : undefined,
    };
  }
  // Back-compat: synthesize from flat event fields
  if (eventData.eventDate) {
    return {
      id: "default",
      startDate: eventData.eventDate as EventSession["startDate"],
      endDate: (eventData.endDate as EventSession["endDate"]) ?? undefined,
      location: (eventData.location as string | undefined) ?? undefined,
      zoomLink: (eventData.zoomLink as string | undefined) ?? undefined,
      capacity:
        typeof eventData.capacity === "number" && eventData.capacity > 0
          ? eventData.capacity
          : undefined,
    };
  }
  return null;
}

export async function getUserRegistrations(
  userId: string
): Promise<RegistrationWithEvent[]> {
  try {
    const snap = await adminDb()
      .collection("registrations")
      .where("userId", "==", userId)
      .orderBy("registeredAt", "desc")
      .get();

    const rows = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data() as Omit<EventRegistration, "id">;
        const sessionId =
          (data as { sessionId?: string }).sessionId ?? "default";
        const reg = {
          id: d.id,
          ...data,
          sessionId,
        };
        const eSnap = await adminDb().collection("events").doc(reg.eventId).get();
        const event = eSnap.exists
          ? ({ id: eSnap.id, ...(eSnap.data() as Omit<Event, "id">) } as Event)
          : null;
        const registeredSession = eSnap.exists
          ? resolveRegisteredSession(eSnap.data() as Record<string, unknown>, sessionId)
          : null;
        return { ...reg, event, registeredSession };
      })
    );
    return rows;
  } catch (err) {
    console.warn("[getUserRegistrations] failed:", err);
    return [];
  }
}

export async function hasUserRegistered(
  userId: string,
  eventId: string
): Promise<boolean> {
  try {
    const snap = await adminDb()
      .collection("registrations")
      .where("userId", "==", userId)
      .where("eventId", "==", eventId)
      .where("paymentStatus", "in", ["paid", "free"])
      .limit(1)
      .get();
    return !snap.empty;
  } catch {
    return false;
  }
}

/**
 * Returns the set of sessionIds the user has already registered (paid/free) for
 * a given event. Used to disable already-registered sessions on the event page.
 */
export async function getUserRegisteredSessionIds(
  userId: string,
  eventId: string
): Promise<Set<string>> {
  try {
    const snap = await adminDb()
      .collection("registrations")
      .where("userId", "==", userId)
      .where("eventId", "==", eventId)
      .where("paymentStatus", "in", ["paid", "free"])
      .get();
    const ids = new Set<string>();
    snap.docs.forEach((d) => {
      const data = d.data() as { sessionId?: string };
      ids.add(data.sessionId ?? "default");
    });
    return ids;
  } catch {
    return new Set<string>();
  }
}

/**
 * Counts confirmed (paid or free) registrations per session for an event.
 * Returns a map of sessionId → count. Missing sessions => 0.
 */
export async function getSessionRegistrationCounts(
  eventId: string
): Promise<Record<string, number>> {
  try {
    const snap = await adminDb()
      .collection("registrations")
      .where("eventId", "==", eventId)
      .where("paymentStatus", "in", ["paid", "free"])
      .get();
    const counts: Record<string, number> = {};
    snap.docs.forEach((d) => {
      const data = d.data() as { sessionId?: string };
      const sid = data.sessionId ?? "default";
      counts[sid] = (counts[sid] ?? 0) + 1;
    });
    return counts;
  } catch (err) {
    console.warn("[getSessionRegistrationCounts] failed:", err);
    return {};
  }
}

/**
 * For admin / cron use — returns confirmed (paid or free) registrations for an event,
 * optionally filtered to a single sessionId.
 */
export async function getEventRegistrations(
  eventId: string,
  sessionId?: string
): Promise<EventRegistration[]> {
  try {
    let q = adminDb()
      .collection("registrations")
      .where("eventId", "==", eventId)
      .where("paymentStatus", "in", ["paid", "free"]);
    if (sessionId) q = q.where("sessionId", "==", sessionId);
    const snap = await q.get();
    return snap.docs.map((d) => {
      const data = d.data() as Omit<EventRegistration, "id">;
      return {
        id: d.id,
        ...data,
        sessionId: (data as { sessionId?: string }).sessionId ?? "default",
      };
    });
  } catch (err) {
    console.warn("[getEventRegistrations] failed:", err);
    return [];
  }
}
