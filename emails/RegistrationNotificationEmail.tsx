import { Link, Text } from "@react-email/components";
import {
  EmailShell,
  COLORS,
  h1Style,
  bodyStyle,
  eyebrowStyle,
  ruleStyle,
  ctaButtonStyle,
} from "./_shared";

interface Props {
  recipientLabel?: string; // e.g. "管理員" or "講師"
  attendeeName?: string;
  attendeeEmail?: string;
  attendeeWhatsapp?: string;
  eventTitle?: string;
  eventDateText?: string;
  location?: string;
  isOnline?: boolean;
  totalRegistered?: number;
  capacity?: number | null;
  adminEventUrl?: string; // link to admin event page
}

export default function RegistrationNotificationEmail({
  recipientLabel = "管理員",
  attendeeName = "—",
  attendeeEmail = "—",
  attendeeWhatsapp = "",
  eventTitle = "活動名稱",
  eventDateText = "日期時間",
  location = "",
  isOnline = false,
  totalRegistered = 0,
  capacity = null,
  adminEventUrl = "https://www.createhub.biz/admin/events",
}: Props) {
  const seatInfo =
    capacity !== null
      ? `${totalRegistered} / ${capacity}`
      : `${totalRegistered}（不限）`;

  return (
    <EmailShell previewText={`【新報名通知】${eventTitle}`}>
      <Text style={eyebrowStyle}>New Registration</Text>
      <div style={ruleStyle} />
      <Text style={h1Style}>有新報名</Text>

      <Text style={bodyStyle}>
        {recipientLabel}你好，以下活動有新嘅參加者報名：
      </Text>

      {/* Event info */}
      <div
        style={{
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.hair}`,
          borderLeft: `4px solid ${COLORS.accent}`,
          padding: "20px 22px",
          margin: "20px 0",
        }}
      >
        <Text
          style={{
            fontFamily: "Georgia, 'Noto Serif TC', serif",
            fontSize: "18px",
            fontWeight: 600,
            color: COLORS.text,
            margin: "0 0 12px",
            lineHeight: "1.35",
          }}
        >
          {eventTitle}
        </Text>
        <InfoRow label="場次" value={eventDateText} />
        {isOnline ? (
          <InfoRow label="形式" value="線上活動（Zoom）" />
        ) : (
          location && <InfoRow label="地點" value={location} />
        )}
        <InfoRow label="此場已報名人數" value={seatInfo} />
      </div>

      {/* Attendee info */}
      <Text
        style={{
          ...eyebrowStyle,
          fontSize: "11px",
          color: COLORS.dark,
          margin: "20px 0 8px",
        }}
      >
        參加者資料
      </Text>
      <div
        style={{
          border: `1px solid ${COLORS.hair}`,
          padding: "16px 20px",
          margin: "0 0 24px",
        }}
      >
        <InfoRow label="姓名" value={attendeeName} />
        <InfoRow label="電郵" value={attendeeEmail} />
        {attendeeWhatsapp && (
          <InfoRow label="WhatsApp" value={attendeeWhatsapp} />
        )}
      </div>

      <div style={{ textAlign: "center" as const, margin: "20px 0" }}>
        <Link href={adminEventUrl} style={ctaButtonStyle}>
          查看完整報名名單
        </Link>
      </div>

      <Text style={{ ...bodyStyle, fontSize: "12px", color: COLORS.softer }}>
        此通知由創研社活動報名系統自動發送。如有疑問請聯絡{" "}
        <Link
          href="mailto:info@createhub.biz"
          style={{ color: COLORS.accent, textDecoration: "none" }}
        >
          info@createhub.biz
        </Link>
        。
      </Text>
    </EmailShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ margin: "0 0 8px" }}>
      <Text
        style={{
          fontSize: "10px",
          color: COLORS.softer,
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          margin: "0 0 2px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: "13px",
          color: COLORS.text,
          margin: 0,
          lineHeight: "1.5",
          fontFamily: "Arial, 'Noto Sans TC', sans-serif",
        }}
      >
        {value}
      </Text>
    </div>
  );
}
