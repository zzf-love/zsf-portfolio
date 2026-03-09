import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070708",
        accent: "#00ffaa",
        "text-primary": "#e8e8e8",
        "text-secondary": "#888888",
        "border-color": "#1a1a1f",
        "card-bg": "#0d0d10",
        "sidebar-bg": "#09090c",
      },
      fontFamily: {
        bebas: ["Bebas Neue", "cursive"],
        mono: ["JetBrains Mono", "monospace"],
        syne: ["Syne", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { transform: "translateX(-10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
