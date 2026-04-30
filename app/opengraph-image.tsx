import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "創研社 CREATE HUB — 學以致用，創出未來";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #084e5e 0%, #042c38 60%, #084e5e 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* Accent top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#34ccef",
          }}
        />

        {/* Radial accent */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(52,204,239,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Top row: eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "3px",
              background: "#34ccef",
            }}
          />
          <div
            style={{
              fontSize: "20px",
              letterSpacing: "0.3em",
              color: "#34ccef",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Hong Kong Business Education
          </div>
        </div>

        {/* Main heading */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "108px",
              fontFamily: "serif",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            學以致用
          </div>
          <div
            style={{
              fontSize: "108px",
              fontFamily: "serif",
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#34ccef",
              marginTop: "8px",
            }}
          >
            創出未來
          </div>
        </div>

        {/* Bottom row: brand lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "38px",
                fontFamily: "serif",
                letterSpacing: "0.25em",
                color: "#ffffff",
              }}
            >
              創 研 社
            </div>
            <div
              style={{
                fontSize: "14px",
                letterSpacing: "0.4em",
                color: "#34ccef",
                marginTop: "8px",
                fontWeight: 700,
              }}
            >
              CREATE HUB
            </div>
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.05em",
            }}
          >
            www.createhub.biz
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
