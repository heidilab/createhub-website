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
  venueAddress?: string;
  mapUrl?: string;
  eventUrl?: string;
}

export default function VenueInfoEmail({
  fullName = "會員",
  eventTitle = "活動名稱",
  eventDateText = "",
  venueAddress = "",
  mapUrl = "",
  eventUrl = "https://createhub.biz/events",
}: Props) {
  return (
    <EmailShell previewText={`【活動地點補充】${eventTitle}`}>
      <Text style={eyebrowStyle}>Venue Information</Text>
      <div style={ruleStyle} />
      <Text style={h1Style}>活動地點補充</Text>

      <Text style={bodyStyle}>
        {fullName}，你好！你早前已成功報名以下活動，特此補充活動地點詳細地址，方便你當日前往。
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

        {eventDateText && <InfoRow label="日期時間" value={eventDateText} />}
        <InfoRow label="活動地點" value={venueAddress} />
      </div>

      {mapUrl && (
        <div style={{ textAlign: "center" as const, margin: "28px 0 16px" }}>
          <Link href={mapUrl} style={ctaButtonStyle}>
            📍 開啟 Google Maps 導航
          </Link>
        </div>
      )}

      <Text style={bodyStyle}>
        建議提早 10 分鐘到達。如有任何疑問，歡迎隨時聯絡我哋。期待喺活動見到你！
      </Text>

      <div
        style={{
          borderTop: `1px solid ${COLORS.hair}`,
          margin: "30px 0 18px",
        }}
      />

      <Text style={{ ...bodyStyle, fontSize: "12px", color: COLORS.softer }}>
        查詢：
        <Link
          href="mailto:info@createhub.biz"
          style={{ color: COLORS.accent, textDecoration: "none" }}
        >
          info@createhub.biz
        </Link>
        {" · "}
        <Link
          href={eventUrl}
          style={{ color: COLORS.accent, textDecoration: "none" }}
        >
          查看活動詳情
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
          lineHeight: "1.6",
          fontFamily: "Arial, 'Noto Sans TC', sans-serif",
        }}
      >
        {value}
      </Text>
    </div>
  );
}
