import { adminDb } from "@/lib/firebase/admin";

export interface AdminStats {
  totalMembers: number;
  upcomingEvents: number;
  todayRegistrations: number;
  totalRegistrations: number;
  newsletterSubscribers: number;
  unreadInquiries: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = adminDb();
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  try {
    const [
      membersSnap,
      upcomingEventsSnap,
      todayRegSnap,
      totalRegSnap,
      newsletterSnap,
      inquiriesSnap,
    ] = await Promise.all([
      db.collection("users").count().get(),
      db
        .collection("events")
        .where("isPublished", "==", true)
        .where("status", "==", "upcoming")
        .where("eventDate", ">=", now)
        .count()
        .get(),
      db
        .collection("registrations")
        .where("registeredAt", ">=", startOfDay)
        .count()
        .get(),
      db.collection("registrations").count().get(),
      db
        .collection("newsletterSubscribers")
        .where("isActive", "==", true)
        .count()
        .get(),
      db
        .collection("contactInquiries")
        .where("isRead", "==", false)
        .count()
        .get(),
    ]);

    return {
      totalMembers: membersSnap.data().count,
      upcomingEvents: upcomingEventsSnap.data().count,
      todayRegistrations: todayRegSnap.data().count,
      totalRegistrations: totalRegSnap.data().count,
      newsletterSubscribers: newsletterSnap.data().count,
      unreadInquiries: inquiriesSnap.data().count,
    };
  } catch (err) {
    console.warn("[getAdminStats] failed:", err);
    return {
      totalMembers: 0,
      upcomingEvents: 0,
      todayRegistrations: 0,
      totalRegistrations: 0,
      newsletterSubscribers: 0,
      unreadInquiries: 0,
    };
  }
}
