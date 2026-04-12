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
        // "concrete" namespace kept for class compatibility but mapped to wood/earth tones
        concrete: {
          50: "#faf3e3",   // parchment
          100: "#f0e2bf",  // cream
          200: "#dec99a",  // light sand
          300: "#c4a574",  // sand
          400: "#a08056",  // tan oak
          500: "#7a5f3f",  // light oak
          600: "#5e4830",  // oak
          700: "#3f2f1f",  // walnut
          800: "#2a1f14",  // dark walnut
          900: "#1a130b",  // espresso
          950: "#0d0905",  // charred
        },
        // "skate" accents kept for class compatibility but mapped to natural earth accents
        skate: {
          lime: "#9caf5e",    // moss / sage (success, landed)
          orange: "#c97142",  // rust / terracotta (in progress)
          red: "#a73e2a",     // brick (warnings, risk)
          cyan: "#d4a042",    // amber / honey (ready, info)
          purple: "#8a5670",  // dusty plum (AI coach accent)
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "wood-grain":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.4' numOctaves='3' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.25 0 0 0 0 0.1 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23w)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;
