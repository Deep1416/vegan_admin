import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "rgb(34 197 94)",
          muted: "rgb(22 163 74)"
        }
      }
    }
  },
  plugins: []
};

export default config;
