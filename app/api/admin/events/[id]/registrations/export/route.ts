import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { formatEventDate } from "@/lib/date";

export const runtime = "nodejs";

interface SessionShape {
  id: string;
  startDate?: unknown;
  location?: string | null;
}

interface UserDoc {
  whatsapp?: string;
  fullName?: string;
}

const STATUS_LABEL: Record<string, string> = {
  paid: "已付款",
  free: "免費",
  pending: "待付款",
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "xlsx").toLowerCase();

  const db = adminDb();
  const eventSnap = await db.collection("events").doc(params.id).get();
  if (!eventSnap.exists) {
    return NextResponse.json({ error: "活動不存在" }, { status: 404 });
  }
  const event = eventSnap.data()!;

  const sessions: SessionShape[] = Array.isArray(event.sessions)
    ? event.sessions
    : [
        {
          id: "default",
          startDate: event.eventDate,
          location: event.location ?? null,
        },
      ];
  const sessionMap: Record<string, SessionShape> = {};
  for (const s of sessions) sessionMap[s.id] = s;

  const regSnap = await db
    .collection("registrations")
    .where("eventId", "==", params.id)
    .get();

  // Fetch user profiles in batches for whatsapp
  const userIds = Array.from(
    new Set(regSnap.docs.map((d) => d.data().userId as string).filter(Boolean))
  );
  const userMap = new Map<string, UserDoc>();
  await Promise.all(
    userIds.map(async (uid) => {
      const us = await db.collection("users").doc(uid).get();
      if (us.exists) userMap.set(uid, us.data() as UserDoc);
    })
  );

  // Build rows, sorted by session then registration time
  const rows = regSnap.docs
    .map((d) => {
      const r = d.data() as {
        userId?: string;
        userName?: string;
        userEmail?: string;
        sessionId?: string;
        paymentStatus?: string;
        status?: string;
        registeredAt?: { toDate?: () => Date; seconds?: number } | Date;
      };
      const sid = r.sessionId ?? "default";
      const session = sessionMap[sid];
      const profile = r.userId ? userMap.get(r.userId) : undefined;
      const registeredAt =
        r.registeredAt instanceof Date
          ? r.registeredAt
          : (r.registeredAt as { toDate?: () => Date })?.toDate?.() ??
            (typeof (r.registeredAt as { seconds?: number })?.seconds ===
            "number"
              ? new Date(
                  ((r.registeredAt as { seconds: number }).seconds ?? 0) * 1000
                )
              : null);
      return {
        sessionId: sid,
        sessionDate: session?.startDate
          ? formatEventDate(session.startDate as string | Date)
          : "—",
        sessionLocation: (session?.location as string | undefined) ?? "—",
        name: r.userName ?? profile?.fullName ?? "—",
        email: r.userEmail ?? "—",
        whatsapp: profile?.whatsapp ?? "",
        status:
          r.status === "cancelled"
            ? "已取消"
            : STATUS_LABEL[r.paymentStatus ?? ""] ?? r.paymentStatus ?? "—",
        registeredAt: registeredAt
          ? `${registeredAt.getFullYear()}-${String(registeredAt.getMonth() + 1).padStart(2, "0")}-${String(registeredAt.getDate()).padStart(2, "0")} ${String(registeredAt.getHours()).padStart(2, "0")}:${String(registeredAt.getMinutes()).padStart(2, "0")}`
          : "—",
      };
    })
    .sort((a, b) => {
      if (a.sessionId !== b.sessionId)
        return a.sessionId.localeCompare(b.sessionId);
      return a.registeredAt.localeCompare(b.registeredAt);
    });

  const filenameSafe = (event.title as string)
    .replace(/[\\/:*?"<>|]/g, "_")
    .slice(0, 60);

  // ── HTML print-friendly export (used to "save as PDF" via browser print) ──
  if (format === "html" || format === "pdf") {
    const html = renderHtml(event.title as string, rows);
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // ── Excel ──────────────────────────────────────────────────
  const headerRow = [
    "場次日期",
    "場次地點",
    "姓名",
    "電郵",
    "WhatsApp",
    "報名狀態",
    "報名時間",
  ];
  const data = [
    headerRow,
    ...rows.map((r) => [
      r.sessionDate,
      r.sessionLocation,
      r.name,
      r.email,
      r.whatsapp,
      r.status,
      r.registeredAt,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [
    { wch: 22 }, // session date
    { wch: 30 }, // session location
    { wch: 18 }, // name
    { wch: 30 }, // email
    { wch: 18 }, // whatsapp
    { wch: 12 }, // status
    { wch: 18 }, // registered at
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "報名名單");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${filenameSafe}_報名名單.xlsx`)}`,
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(
  title: string,
  rows: Array<{
    sessionDate: string;
    sessionLocation: string;
    name: string;
    email: string;
    whatsapp: string;
    status: string;
    registeredAt: string;
  }>
): string {
  const tbody = rows
    .map(
      (r) => `<tr>
      <td>${escapeHtml(r.sessionDate)}</td>
      <td>${escapeHtml(r.sessionLocation)}</td>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.email)}</td>
      <td>${escapeHtml(r.whatsapp)}</td>
      <td>${escapeHtml(r.status)}</td>
      <td>${escapeHtml(r.registeredAt)}</td>
    </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="zh-HK">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} — 報名名單</title>
<style>
  body { font-family: -apple-system, "Noto Sans TC", sans-serif; padding: 24px; color: #042c38; }
  h1 { font-size: 22px; margin: 0 0 4px; font-family: Georgia, "Noto Serif TC", serif; }
  .meta { font-size: 12px; color: #5a7a82; margin-bottom: 18px; }
  .actions { margin-bottom: 16px; }
  button { font-size: 13px; padding: 8px 16px; cursor: pointer; background: #084e5e; color: #fff; border: none; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #c0e4ec; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #f6fdfe; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #5a7a82; }
  @media print {
    .actions { display: none; }
    body { padding: 0; }
  }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">報名名單 · 共 ${rows.length} 位 · 匯出時間：${new Date().toLocaleString("zh-HK")}</div>
  <div class="actions">
    <button onclick="window.print()">列印 / 儲存為 PDF</button>
  </div>
  <table>
    <thead>
      <tr>
        <th>場次日期</th>
        <th>場次地點</th>
        <th>姓名</th>
        <th>電郵</th>
        <th>WhatsApp</th>
        <th>狀態</th>
        <th>報名時間</th>
      </tr>
    </thead>
    <tbody>
      ${tbody || '<tr><td colspan="7" style="text-align:center;color:#7a9aaa;padding:24px">未有報名</td></tr>'}
    </tbody>
  </table>
  <script>
    // Auto-trigger print dialog after a brief delay so the user can save as PDF
    setTimeout(() => window.print(), 400);
  </script>
</body>
</html>`;
}
