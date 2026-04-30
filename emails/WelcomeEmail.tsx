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

export default function WelcomeEmail({
  fullName = "會員",
  siteUrl = "https://www.createhub.biz",
  learnworldsUrl = "https://createhub.learnworlds.com/home",
}: {
  fullName?: string;
  siteUrl?: string;
  learnworldsUrl?: string;
}) {
  return (
    <EmailShell previewText="歡迎加入創研社 CREATE HUB！">
      <Text style={eyebrowStyle}>Welcome</Text>
      <div style={ruleStyle} />
      <Text style={h1Style}>歡迎加入，{fullName}</Text>

      <Text style={bodyStyle}>
        多謝你成為創研社 CREATE HUB 嘅一份子！
        <br />
        我哋係一個集合豐富營商經驗嘅老闆及專業團隊嘅商業教育平台，致力幫助每一位學員建立實戰嘅商業知識。
      </Text>

      <Text style={{ ...bodyStyle, marginTop: "16px" }}>作為會員，你可以：</Text>

      <ul
        style={{
          paddingLeft: "20px",
          color: COLORS.muted,
          fontSize: "14px",
          lineHeight: "1.9",
          margin: "0 0 24px",
        }}
      >
        <li>📚 隨時進入線上學習平台，修讀最新商業課程</li>
        <li>🗓 報名參加線上及線下活動，與業界精英交流</li>
        <li>📧 收取最新活動資訊同商業洞察</li>
      </ul>

      <div style={{ textAlign: "center" as const, margin: "32px 0 12px" }}>
        <Link href={`${siteUrl}/events`} style={ctaButtonStyle}>
          查看即將舉行活動
        </Link>
      </div>

      <Text
        style={{
          ...bodyStyle,
          fontSize: "13px",
          textAlign: "center",
          color: COLORS.softer,
        }}
      >
        或前往{" "}
        <Link
          href={learnworldsUrl}
          style={{ color: COLORS.accent, textDecoration: "none" }}
        >
          線上學習平台
        </Link>
      </Text>

      <div
        style={{
          borderTop: `1px solid ${COLORS.hair}`,
          margin: "30px 0 20px",
        }}
      />

      <Text
        style={{
          ...bodyStyle,
          fontSize: "12px",
          color: COLORS.softer,
        }}
      >
        如有任何查詢，歡迎電郵至{" "}
        <Link
          href="mailto:info@createhub.biz"
          style={{ color: COLORS.accent, textDecoration: "none" }}
        >
          info@createhub.biz
        </Link>{" "}
        或 WhatsApp +852 9691 6190。
      </Text>
    </EmailShell>
  );
}
