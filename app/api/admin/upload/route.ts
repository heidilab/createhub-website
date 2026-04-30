import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/firebase/session";
import { adminStorage } from "@/lib/firebase/admin";

const ALLOWED_FOLDERS = new Set(["events", "team", "articles", "venue"]);
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const folder = (fd.get("folder") as string) || "events";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "不支援此檔案格式" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "檔案大小不能超過 5MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const objectPath = `${folder}/${randomUUID()}.${ext}`;

    const bucket = adminStorage().bucket();
    const blob = bucket.file(objectPath);
    const arrayBuffer = await file.arrayBuffer();

    const token = randomUUID();
    await blob.save(Buffer.from(arrayBuffer), {
      contentType: file.type,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const bucketName = bucket.name;
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      objectPath
    )}?alt=media&token=${token}`;

    return NextResponse.json({ ok: true, url, path: objectPath });
  } catch (err) {
    console.error("[POST upload]", err);
    return NextResponse.json({ error: "上傳失敗" }, { status: 500 });
  }
}
