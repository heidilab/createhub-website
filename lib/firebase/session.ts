import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./admin";

export type SessionUser = {
  uid: string;
  email: string;
  role: "member" | "admin";
  fullName: string;
};

const SESSION_COOKIE = "__session";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    const snap = await adminDb().collection("users").doc(decoded.uid).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    return {
      uid: decoded.uid,
      email: data.email ?? decoded.email ?? "",
      role: (data.role as "member" | "admin") ?? "member",
      fullName: data.fullName ?? "",
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}
