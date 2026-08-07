import type { Config } from "tailwindcss";

export default {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#191714", soft: "#4A453E", faint: "#8A8378" },
        cream: { DEFAULT: "#FAF8F4", deep: "#F1EDE5" },
        ember: { DEFAULT: "#E4572E", deep: "#C6431C", soft: "#FBEAE3" },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(25,23,20,0.05), 0 8px 24px rgba(25,23,20,0.06)",
        pop: "0 2px 6px rgba(25,23,20,0.08), 0 20px 60px rgba(25,23,20,0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
