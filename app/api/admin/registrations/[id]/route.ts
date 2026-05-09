import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

interface SessionShape {
  id: string;
  capacity?: number | null;
}

async function assertAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin();
    await adminDb().collection("registrations").doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE registration]", err);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}

/**
 * Move a registration to a different event and/or session.
 * Body: { eventId?: string, sessionId: string }
 * - If eventId is provided, validates the new event/session combo.
 * - Performs capacity + duplicate checks for the destination session.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await assertAdmin();
    const body = await req.json();
    const { eventId: newEventId, sessionId: newSessionId } = body as {
      eventId?: string;
      sessionId?: string;
    };

    if (!newSessionId) {
      return NextResponse.json(
        { error: "請指定要移去嘅場次" },
        { status: 400 }
      );
    }

    const db = adminDb();
    const regRef = db.collection("registrations").doc(params.id);
    const regSnap = await regRef.get();
    if (!regSnap.exists) {
      return NextResponse.json({ error: "報名記錄不存在" }, { status: 404 });
    }
    const reg = regSnap.data()!;

    const targetEventId = newEventId || reg.eventId;

    // Validate target event + session
    const eventSnap = await db.collection("events").doc(targetEventId).get();
    if (!eventSnap.exists) {
      return NextResponse.json({ error: "目標活動不存在" }, { status: 404 });
    }
    const eventData = eventSnap.data()!;
    const sessions: SessionShape[] = Array.isArray(eventData.sessions)
      ? eventData.sessions
      : [
          {
            id: "default",
            capacity:
              typeof eventData.capacity === "number"
                ? eventData.capacity
                : null,
          },
        ];
    const targetSession = sessions.find((s) => s.id === newSessionId);
    if (!targetSession) {
      return NextResponse.json(
        { error: "目標場次不存在" },
        { status: 404 }
      );
    }

    // Skip checks if already in this event+session (no-op)
    const isSamePlace =
      reg.eventId === targetEventId && reg.sessionId === newSessionId;

    if (!isSamePlace) {
      // Duplicate check: user already registered for the target session?
      const dupSnap = await db
        .collection("registrations")
        .where("userId", "==", reg.userId)
        .where("eventId", "==", targetEventId)
        .where("sessionId", "==", newSessionId)
        .where("paymentStatus", "in", ["paid", "free"])
        .limit(1)
        .get();
      if (!dupSnap.empty) {
        return NextResponse.json(
          { error: "該會員已報名目標場次，無法重複轉移" },
          { status: 409 }
        );
      }

      // Capacity check on target
      if (
        typeof targetSession.capacity === "number" &&
        targetSession.capacity > 0
      ) {
        const countSnap = await db
          .collection("registrations")
          .where("eventId", "==", targetEventId)
          .where("sessionId", "==", newSessionId)
          .where("paymentStatus", "in", ["paid", "free"])
          .count()
          .get();
        if (countSnap.data().count >= targetSession.capacity) {
          return NextResponse.json(
            { error: "目標場次已滿額" },
            { status: 409 }
          );
        }
      }
    }

    await regRef.update({
      eventId: targetEventId,
      sessionId: newSessionId,
      movedAt: new Date(),
      // Reset reminder flag so the new session's reminder can be sent
      reminderSentAt: null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH registration]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
