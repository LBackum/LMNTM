import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette (from Dr. Karen R. January)
        mist: "#c5ced9",      // soft blue-grey — backgrounds, surfaces
        sage: "#657332",      // olive green — accents, links
        sand: "#f2c185",      // warm peach — highlights, CTAs
        cocoa: "#593325",     // deep brown — primary text, navigation
        garnet: "#732626",    // burgundy — purchase buttons, emphasis
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        page: "0 10px 40px -20px rgba(89, 51, 37, 0.35)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
