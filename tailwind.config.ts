import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f8fb",
        surface: "#ffffff",
        line: "#dbe2ea",
        ink: "#132235",
        muted: "#5b6a7a",
        brand: "#0064d1",
        danger: "#cc2b3b",
        caution: "#ea7a00"
      },
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "sans-serif"]
      },
      boxShadow: {
        panel: "0 16px 40px rgba(19, 34, 53, 0.08)"
      },
      backgroundImage: {
        "page-glow":
          "radial-gradient(circle at 15% 20%, #e0f0ff, transparent 40%), radial-gradient(circle at 90% 0%, #ffe8e4, transparent 32%)"
      }
    }
  },
  plugins: []
};

export default config;
