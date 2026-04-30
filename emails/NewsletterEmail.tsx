import { Link, Text } from "@react-email/components";
import {
  EmailShell,
  COLORS,
  h1Style,
  bodyStyle,
  eyebrowStyle,
  ruleStyle,
} from "./_shared";

interface Event {
  id: string;
  title: string;
  dateText: string;
  category: string;
  eventType: string;
  url: string;
}

export default function NewsletterEmail({
  subject = "創研社最新動向",
  htmlContent = "",
  events = [],
  siteUrl = "https://www.createhub.biz",
  unsubscribeUrl = "",
}: {
  subject?: string;
  htmlContent?: string;
  events?: Event[];
  siteUrl?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <EmailShell previewText={subject}>
      <Text style={eyebrowStyle}>Newsletter</Text>
      <div style={ruleStyle} />
      <Text style={h1Style}>{subject}</Text>

      {htmlContent && (
        <div
          style={{
            ...bodyStyle,
            whiteSpace: "pre-wrap" as const,
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}

      {events.length > 0 && (
        <>
          <div
            style={{
              borderTop: `1px solid ${COLORS.hair}`,
              margin: "30px 0 20px",
            }}
          />
          <Text style={{ ...eyebrowStyle, marginTop: 0 }}>
            即將舉行活動
          </Text>
          <div style={ruleStyle} />

          {events.map((e) => (
            <Link
              key={e.id}
              href={e.url}
              style={{
                display: "block",
                textDecoration: "none",
                border: `1px solid ${COLORS.hair}`,
                padding: "14px 16px",
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontFamily: "Georgia, 'Noto Serif TC', serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: COLORS.text,
                  margin: "0 0 6px",
                  lineHeight: "1.4",
                }}
              >
                {e.title}
              </Text>
              <Text
                style={{
                  fontSize: "11px",
                  color: COLORS.softer,
                  margin: 0,
                  letterSpacing: "0.05em",
                }}
              >
                {e.dateText} · {e.category} · {e.eventType}
              </Text>
            </Link>
          ))}

          <div style={{ textAlign: "center" as const, marginTop: "18px" }}>
            <Link
              href={`${siteUrl}/events`}
              style={{
                color: COLORS.accent,
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 700,
                borderBottom: `1px solid ${COLORS.accent}`,
                paddingBottom: "1px",
              }}
            >
              查看所有活動 →
            </Link>
          </div>
        </>
      )}

      {unsubscribeUrl && (
        <Text
          style={{
            fontSize: "10px",
            color: COLORS.softer,
            textAlign: "center",
            marginTop: "28px",
            paddingTop: "18px",
            borderTop: `1px solid ${COLORS.hair}`,
          }}
        >
          <Link
            href={unsubscribeUrl}
            style={{ color: COLORS.softer, textDecoration: "underline" }}
          >
            取消訂閱
          </Link>
        </Text>
      )}
    </EmailShell>
  );
}
