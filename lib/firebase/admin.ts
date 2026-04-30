import "server-only";
import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth as getAdminAuth, type Auth } from "firebase-admin/auth";
import {
  getFirestore as getAdminFirestore,
  type Firestore,
} from "firebase-admin/firestore";
import {
  getStorage as getAdminStorage,
  type Storage,
} from "firebase-admin/storage";

export const isAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

let _app: App | null = null;

export function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0]!;
    return _app;
  }
  if (!isAdminConfigured) {
    throw new Error(
      "Firebase Admin SDK not configured. Set FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY in .env.local."
    );
  }
  _app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return _app;
}

export function adminAuth(): Auth {
  return getAdminAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getAdminFirestore(getAdminApp());
}

export function adminStorage(): Storage {
  return getAdminStorage(getAdminApp());
}
