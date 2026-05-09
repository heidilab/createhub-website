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
  speakerNames?: string;
  eventUrl?: string;
}

export default function EventReminderEmail({
  fullName = "會員",
  eventTitle = "活動名稱",
  eventDateText = "明日",
  location = "",
  isOnline = false,
  zoomLink = "",
  speakerNames = "",
  eventUrl = "https://www.createhub.biz/events",
}: Props) {
  return (
    <EmailShell previewText={`【活動提醒】聽日見：${eventTitle}`}>
      <Text style={eyebrowStyle}>Event Reminder</Text>
      <div style={ruleStyle} />
      <Text style={h1Style}>聽日活動提醒</Text>

      <Text style={bodyStyle}>
        {fullName}，溫馨提醒：你報名嘅活動 <strong>聽日</strong> 就會舉行。
      </Text>

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
        {speakerNames && (
          <InfoRow
            label={speakerNames.includes(",") ? "講師團隊" : "講師"}
            value={speakerNames}
          />
        )}
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
            <Text style={{ ...bodyStyle, margin: "0 0 6px", fontSize: "12px" }}>
              Zoom 連結（請提早幾分鐘進入）：
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

      <Text style={bodyStyle}>
        如果你 <strong>無法出席</strong>，請盡快電郵 info@createhub.biz
        通知我哋，等其他想參加嘅人有機會候補。
      </Text>

      <div style={{ textAlign: "center" as const, margin: "28px 0 16px" }}>
        <Link href={eventUrl} style={ctaButtonStyle}>
          查看活動詳情
        </Link>
      </div>

      <Text style={{ ...bodyStyle, fontSize: "12px", color: COLORS.softer }}>
        我哋期待聽日喺活動見到你！
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
