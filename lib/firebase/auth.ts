"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./client";

export type UserProfile = {
  uid: string;
  email: string;
  fullName: string;
  whatsapp?: string;
  role: "member" | "admin";
  isNewsletterSubscribed: boolean;
  photoURL?: string;
  createdAt?: unknown;
};

async function ensureProfile(
  user: User,
  extras: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? extras.email ?? "",
    fullName: extras.fullName || user.displayName || "",
    whatsapp: extras.whatsapp || "",
    role: "member",
    isNewsletterSubscribed: extras.isNewsletterSubscribed ?? true,
    photoURL: user.photoURL ?? undefined,
  };

  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });

  // Trigger welcome email (server route)
  try {
    await fetch("/api/emails/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        fullName: profile.fullName,
      }),
    });
  } catch {
    // non-fatal
  }

  return profile;
}

export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string,
  whatsapp?: string,
  isNewsletterSubscribed = true
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName) {
    await updateProfile(cred.user, { displayName: fullName });
  }
  await ensureProfile(cred.user, { fullName, whatsapp, isNewsletterSubscribed });
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureProfile(cred.user);
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  await ensureProfile(cred.user);
  return cred.user;
}

export async function signOut() {
  await fbSignOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}
