import { Text } from "@react-email/components";
import { EmailShell, COLORS, h1Style, bodyStyle, eyebrowStyle, ruleStyle } from "./_shared";

interface Props {
  name?: string;
  email?: string;
  whatsapp?: string;
  category?: string;
  message?: string;
}

export default function ContactNotificationEmail({
  name = "",
  email = "",
  whatsapp = "",
  category = "",
  message = "",
}: Props) {
  const categoryLabels: Record<string, string> = {
    course: "課程查詢",
    event: "活動查詢",
    other: "其他",
  };
  return (
    <EmailShell previewText={`新聯絡表單留言 — ${name}`}>
      <Text style={eyebrowStyle}>New Inquiry</Text>
      <div style={ruleStyle} />
      <Text style={h1Style}>新聯絡表單留言</Text>

      <Text style={bodyStyle}>
        有新嘅聯絡表單提交，請跟進回覆。
      </Text>

      <div
        style={{
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.hair}`,
          padding: "20px 22px",
          margin: "20px 0",
        }}
      >
        <InfoRow label="姓名" value={name} />
        <InfoRow label="電郵" value={email} />
        {whatsapp && <InfoRow label="WhatsApp" value={whatsapp} />}
        <InfoRow label="類別" value={categoryLabels[category] || category} />
        <div style={{ borderTop: `1px solid ${COLORS.hair}`, margin: "14px 0 12px" }} />
        <Text
          style={{
            fontSize: "10px",
            color: COLORS.softer,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            margin: "0 0 6px",
          }}
        >
          訊息內容
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: COLORS.text,
            lineHeight: "1.8",
            whiteSpace: "pre-wrap" as const,
            margin: 0,
          }}
        >
          {message}
        </Text>
      </div>
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
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: "14px", color: COLORS.text, margin: 0, lineHeight: "1.4" }}>
        {value}
      </Text>
    </div>
  );
}
