import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./emails/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        brand: {
          bg: "#f6fdfe",
          dark: "#084e5e",
          accent: "#34ccef",
          text: "#042c38",
          light: "#a8eaf7",
          muted: "#5a7a82",
          softer: "#7a9aaa",
          hair: "#e0eef2",
          rule: "#c0e4ec",
          wash: "#ddf0f5",
          tag: "#e0f5fa",
          tagText: "#0a7a96",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-tc)", "system-ui", "sans-serif"],
        serif: ["var(--font-garamond)", "var(--font-noto-serif-tc)", "Georgia", "serif"],
        display: ["var(--font-garamond)", "var(--font-noto-serif-tc)", "Georgia", "serif"],
        outfit: ["var(--font-outfit)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
        "logo-tc": "0.3em",
        "logo-en": "0.4em",
      },
      borderRadius: {
        lg: "0.25rem",
        md: "0.125rem",
        sm: "0",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-slow": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out",
        "fade-in-slow": "fade-in-slow 1.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
