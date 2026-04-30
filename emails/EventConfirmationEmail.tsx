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
  fullName?: string;
  eventTitle?: string;
  eventDateText?: string;
  location?: string;
  isOnline?: boolean;
  zoomLink?: string;
  speakerName?: string;
  eventUrl?: string;
  addToCalendarUrl?: string;
}

export default function EventConfirmationEmail({
  fullName = "會員",
  eventTitle = "活動名稱",
  eventDateText = "日期時間",
  location = "",
  isOnline = false,
  zoomLink = "",
  speakerName = "",
  eventUrl = "https://www.createhub.biz/events",
  addToCalendarUrl = "",
}: Props) {
  return (
    <EmailShell previewText={`【報名確認】${eventTitle}`}>
      <Text style={eyebrowStyle}>Registration Confirmed</Text>
      <div style={ruleStyle} />
      <Text style={h1Style}>報名成功！</Text>

      <Text style={bodyStyle}>
        {fullName}，感謝你報名參加以下活動。我哋期待與你喺活動見面。
      </Text>

      {/* Event info box */}
      <div
        style={{
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.hair}`,
          borderLeft: `4px solid ${COLORS.accent}`,
          padding: "20px 22px",
          margin: "24px 0",
        }}
      >
        <Text
          style={{
            fontFamily: "Georgia, 'Noto Serif TC', serif",
            fontSize: "20px",
            fontWeight: 600,
            color: COLORS.text,
            margin: "0 0 14px",
            lineHeight: "1.35",
          }}
        >
          {eventTitle}
        </Text>

        <InfoRow label="日期時間" value={eventDateText} />
        {speakerName && <InfoRow label="講師" value={speakerName} />}
        {isOnline ? (
          <InfoRow label="形式" value="線上活動（Zoom）" />
        ) : (
          location && <InfoRow label="地點" value={location} />
        )}

        {isOnline && zoomLink && (
          <>
            <div
              style={{
                borderTop: `1px solid ${COLORS.hair}`,
                margin: "14px 0",
              }}
            />
            <Text
              style={{ ...bodyStyle, margin: "0 0 6px", fontSize: "12px" }}
            >
              Zoom 連結：
            </Text>
            <Link
              href={zoomLink}
              style={{
                color: COLORS.accent,
                textDecoration: "underline",
                fontSize: "13px",
                wordBreak: "break-all" as const,
              }}
            >
              {zoomLink}
            </Link>
          </>
        )}
      </div>

      <div style={{ textAlign: "center" as const, margin: "28px 0 16px" }}>
        <Link href={eventUrl} style={ctaButtonStyle}>
          查看活動詳情
        </Link>
      </div>

      {addToCalendarUrl && (
        <Text
          style={{
            ...bodyStyle,
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          <Link
            href={addToCalendarUrl}
            style={{ color: COLORS.accent, textDecoration: "none" }}
          >
            加入 Google Calendar →
          </Link>
        </Text>
      )}

      <div
        style={{
          borderTop: `1px solid ${COLORS.hair}`,
          margin: "30px 0 18px",
        }}
      />

      <Text style={{ ...bodyStyle, fontSize: "12px", color: COLORS.softer }}>
        如需取消報名或有其他查詢，請電郵至{" "}
        <Link
          href="mailto:info@createhub.biz"
          style={{ color: COLORS.accent, textDecoration: "none" }}
        >
          info@createhub.biz
        </Link>
      </Text>
    </EmailShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ margin: "0 0 10px" }}>
      <Text
        style={{
          fontSize: "10px",
          color: COLORS.softer,
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          margin: "0 0 3px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: "14px",
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
