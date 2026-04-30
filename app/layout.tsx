import type { Metadata } from "next";
import { Inter, Noto_Sans_TC, Noto_Serif_TC, EB_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const notoTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-tc",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "創研社 CREATE HUB — 香港商業教育平台",
    template: "%s | 創研社 CREATE HUB",
  },
  description:
    "創研社 CREATE HUB 集合豐富營商經驗的老闆及專業團隊，透過線上課程及線下活動，提供實戰商業教育，助你掌握市場趨勢，開拓無限可能。",
  keywords: [
    "創研社",
    "CREATE HUB",
    "香港商業教育",
    "商業課程",
    "創業課程",
    "商業講座",
    "工作坊",
  ],
  authors: [{ name: "創研社 CREATE HUB" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.createhub.biz"
  ),
  openGraph: {
    type: "website",
    locale: "zh_HK",
    url: "/",
    siteName: "創研社 CREATE HUB",
    title: "創研社 CREATE HUB — 香港商業教育平台",
    description:
      "學以致用，創出未來。創研社提供專業課程及實戰活動，助你掌握商業新知識。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-HK"
      className={`${notoTC.variable} ${notoSerifTC.variable} ${inter.variable} ${ebGaramond.variable} ${outfit.variable}`}
    >
      <body className="font-sans antialiased bg-white text-brand-text">
        <div className="brand-top-line" aria-hidden="true" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
