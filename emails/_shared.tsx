import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import type { ReactNode } from "react";

export const COLORS = {
  bg: "#f6fdfe",
  dark: "#084e5e",
  accent: "#34ccef",
  text: "#042c38",
  muted: "#5a7a82",
  softer: "#7a9aaa",
  hair: "#e0eef2",
  rule: "#c0e4ec",
  white: "#ffffff",
};

const wrapperStyle = { backgroundColor: COLORS.bg, padding: "32px 0" };

const containerStyle = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: COLORS.white,
  border: `1px solid ${COLORS.hair}`,
};

export function EmailShell({
  previewText,
  children,
}: {
  previewText: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={wrapperStyle}>
        <Container style={containerStyle}>
          {/* top accent line */}
          <div
            style={{
              height: "5px",
              backgroundColor: COLORS.accent,
            }}
          />
          {/* header */}
          <Section
            style={{
              padding: "28px 32px 22px",
              borderBottom: `1px solid ${COLORS.hair}`,
              backgroundColor: COLORS.dark,
            }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    fontSize: "18px",
                    color: COLORS.white,
                    letterSpacing: "0.25em",
                    margin: 0,
                    fontFamily: "Georgia, 'Noto Serif TC', serif",
                  }}
                >
                  創 研 社
                </Text>
                <Text
                  style={{
                    fontSize: "10px",
                    color: COLORS.accent,
                    letterSpacing: "0.35em",
                    margin: "4px 0 0",
                    fontFamily: "Arial, sans-serif",
                    textTransform: "uppercase",
                  }}
                >
                  CREATE HUB
                </Text>
              </Column>
            </Row>
          </Section>

          {/* content */}
          <Section style={{ padding: "36px 32px" }}>{children}</Section>

          {/* footer */}
          <Section
            style={{
              padding: "20px 32px",
              borderTop: `1px solid ${COLORS.hair}`,
              backgroundColor: COLORS.bg,
            }}
          >
            <Text
              style={{
                fontSize: "11px",
                color: COLORS.softer,
                lineHeight: "1.7",
                margin: 0,
              }}
            >
              創研社 CREATE HUB · Lai Chi Kok, Hong Kong
              <br />
              <Link
                href="mailto:info@createhub.biz"
                style={{ color: COLORS.accent, textDecoration: "none" }}
              >
                info@createhub.biz
              </Link>{" "}
              ·{" "}
              <Link
                href="https://www.createhub.biz"
                style={{ color: COLORS.accent, textDecoration: "none" }}
              >
                www.createhub.biz
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const h1Style = {
  fontFamily: "Georgia, 'Noto Serif TC', serif",
  fontSize: "26px",
  fontWeight: 600,
  color: COLORS.text,
  margin: "0 0 12px",
  lineHeight: "1.3",
};

export const bodyStyle = {
  fontFamily: "Arial, 'Noto Sans TC', sans-serif",
  fontSize: "14px",
  color: COLORS.muted,
  lineHeight: "1.85",
  margin: "0 0 14px",
};

export const eyebrowStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: "10px",
  color: COLORS.accent,
  letterSpacing: "0.25em",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};

export const ruleStyle = {
  display: "inline-block",
  width: "32px",
  height: "2px",
  backgroundColor: COLORS.accent,
  margin: "0 0 18px",
};

export const ctaButtonStyle = {
  display: "inline-block",
  backgroundColor: COLORS.dark,
  color: COLORS.white,
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  padding: "12px 24px",
  textDecoration: "none",
  fontFamily: "Arial, sans-serif",
};
