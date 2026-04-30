import { adminDb } from "@/lib/firebase/admin";
import type { Event, EventRegistration } from "@/types";

type RegistrationWithEvent = EventRegistration & { event: Event | null };

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
        const reg = { id: d.id, ...(d.data() as Omit<EventRegistration, "id">) };
        const eSnap = await adminDb().collection("events").doc(reg.eventId).get();
        const event = eSnap.exists
          ? ({ id: eSnap.id, ...(eSnap.data() as Omit<Event, "id">) } as Event)
          : null;
        return { ...reg, event };
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
