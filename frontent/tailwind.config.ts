import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary:   "#1B4965",
        secondary: "#5FA8D3",
        accent:    "#62B6CB",
        bgLight:   "#CAE9FF",
        bgSoft:    "#BEE9E8",
        success:   "#16A34A",
        warning:   "#F59E0B",
        danger:    "#DC2626",
      },
      fontFamily: {
        sans:    ["'DM Sans'",  "sans-serif"],
        display: ["'Sora'",     "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
