import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#06070B",
          900: "#090A10",
          850: "#0F111B",
          800: "#141724",
          700: "#1E2235",
          600: "#2B304A",
        },
        wine: {
          950: "#4C0519",
          900: "#881337",
          800: "#9F1239",
          700: "#BE123C",
          600: "#E11D48",
          500: "#F43F5E",
          400: "#FB7185",
          300: "#FDA4AF",
          200: "#FECDD3",
          100: "#FFE4E6",
          50: "#FFF1F2",
        },
        gold: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-wine": "0 0 25px -5px rgba(225, 29, 72, 0.35)",
        "glow-gold": "0 0 25px -5px rgba(245, 158, 11, 0.3)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-light": "0 8px 32px 0 rgba(225, 29, 72, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
