import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Late Push palette
        ink: {
          DEFAULT: "#0e0d0c",
          2: "#1a1816",
          3: "#24211e",
        },
        paper: {
          DEFAULT: "#f2ece0",
          2: "#e4dccb",
          3: "#c9bfa8",
          dim: "#8a8273",
        },
        hazard: {
          DEFAULT: "#f5d400",
          deep: "#d9bc00",
        },
        coral: "#ff5a3c",
        mint: "#78d19a",
        violet: "#b38cff",
        sky: "#7ec7ff",
        brick: "#c93a2a",

        // Back-compat: map old names to the new palette so pages not yet
        // migrated still render with the new theme rather than breaking.
        // These get removed once every page is migrated off them.
        concrete: {
          50: "#f2ece0",
          100: "#f2ece0",
          200: "#e4dccb",
          300: "#c9bfa8",
          400: "#8a8273",
          500: "#8a8273",
          600: "#5a5448",
          700: "#24211e",
          800: "#1a1816",
          900: "#1a1816",
          950: "#0e0d0c",
        },
        skate: {
          lime: "#78d19a",
          orange: "#ff5a3c",
          red: "#c93a2a",
          cyan: "#7ec7ff",
          purple: "#b38cff",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        hammer: ["var(--font-anton)", "Anton", "sans-serif"],
        body: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
