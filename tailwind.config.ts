import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        brand: {
          black: "#0a0a0a",
          white: "#fafafa",
          gray: {
            50: "#f9f9f9",
            100: "#f0f0f0",
            200: "#e0e0e0",
            300: "#c0c0c0",
            400: "#909090",
            500: "#606060",
            600: "#404040",
            700: "#303030",
            800: "#202020",
            900: "#101010",
          },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        "marquee-slow": "marquee 40s linear infinite",
        "announcement-scroll": "announcementScroll 20s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        announcementScroll: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
