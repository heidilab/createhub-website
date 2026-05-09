// Shared payload normalization for the admin events endpoints (POST + PATCH).
// Validates and shapes the request body into a Firestore-ready document.

interface SpeakerInput {
  name?: unknown;
  bio?: unknown;
  photoUrl?: unknown;
}

interface SessionInput {
  id?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  location?: unknown;
  zoomLink?: unknown;
  capacity?: unknown;
}

interface BuildResult {
  data: Record<string, unknown>;
}

interface BuildError {
  error: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genId(): string {
  // randomUUID is available in Node 18+ runtime
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function buildEventDoc(
  body: Record<string, unknown>,
  opts: { isCreate: boolean }
): BuildResult | BuildError {
  // ── Speakers ──────────────────────────────────────────────
  const speakersRaw = Array.isArray(body.speakers)
    ? (body.speakers as SpeakerInput[])
    : [];
  const speakers = speakersRaw
    .map((s) => ({
      name: typeof s.name === "string" ? s.name.trim() : "",
      bio: typeof s.bio === "string" && s.bio.trim() ? s.bio.trim() : null,
      photoUrl:
        typeof s.photoUrl === "string" && s.photoUrl.trim()
          ? s.photoUrl.trim()
          : null,
    }))
    .filter((s) => s.name.length > 0);

  if (opts.isCreate && speakers.length === 0) {
    return { error: "最少要有一位講師" };
  }

  // ── Speaker emails ────────────────────────────────────────
  const emailsRaw = Array.isArray(body.speakerEmails)
    ? (body.speakerEmails as unknown[])
    : [];
  const speakerEmails = Array.from(
    new Set(
      emailsRaw
        .filter((e): e is string => typeof e === "string")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => EMAIL_RE.test(e))
    )
  );

  // ── Sessions ──────────────────────────────────────────────
  const sessionsRaw = Array.isArray(body.sessions)
    ? (body.sessions as SessionInput[])
    : [];

  if (opts.isCreate && sessionsRaw.length === 0) {
    return { error: "最少要有一個場次" };
  }

  const sessions: Array<{
    id: string;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    zoomLink: string | null;
    capacity: number | null;
  }> = [];
  for (let idx = 0; idx < sessionsRaw.length; idx++) {
    const s = sessionsRaw[idx];
    const startStr = typeof s.startDate === "string" ? s.startDate : "";
    if (!startStr) {
      return { error: `第 ${idx + 1} 場：缺少開始時間` };
    }
    const start = new Date(startStr);
    if (isNaN(start.getTime())) {
      return { error: `第 ${idx + 1} 場：開始時間格式錯誤` };
    }
    const endStr = typeof s.endDate === "string" ? s.endDate : null;
    const end = endStr ? new Date(endStr) : null;
    const capRaw = s.capacity;
    let capacity: number | null = null;
    if (typeof capRaw === "number" && capRaw > 0) capacity = capRaw;
    else if (typeof capRaw === "string" && capRaw.trim()) {
      const n = Number(capRaw);
      if (!isNaN(n) && n > 0) capacity = n;
    }
    sessions.push({
      id: typeof s.id === "string" && s.id ? s.id : genId(),
      startDate: start,
      endDate: end && !isNaN(end.getTime()) ? end : null,
      location:
        typeof s.location === "string" && s.location.trim()
          ? s.location.trim()
          : null,
      zoomLink:
        typeof s.zoomLink === "string" && s.zoomLink.trim()
          ? s.zoomLink.trim()
          : null,
      capacity,
    });
  }

  // ── Derive top-level fields from first session for sort/query compat ──
  const first = sessions[0];

  const data: Record<string, unknown> = {
    title: body.title ?? "",
    description: body.description ?? "",
    coverImage: body.coverImage || null,
    eventType: body.eventType,
    category: body.category,
    isFree: !!body.isFree,
    priceHkd: Number(body.priceHkd) || 0,
    status: body.status || "upcoming",
    isPublished: !!body.isPublished,
    speakers,
    speakerEmails,
    sessions,
    // Mirror of first session, used by existing top-level queries (eventDate orderBy).
    eventDate: first ? first.startDate : null,
    endDate: first?.endDate ?? null,
    location: first?.location ?? null,
    zoomLink: first?.zoomLink ?? null,
    capacity: first?.capacity ?? null,
    // Mirror first speaker into the legacy flat fields for any old reader/email template.
    speakerName: speakers[0]?.name ?? null,
    speakerBio: speakers[0]?.bio ?? null,
  };

  return { data };
}
