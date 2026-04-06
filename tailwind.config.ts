import type { Config } from "tailwindcss";

/**
 * Tailwind CSS configuration.
 *
 * NOTE: This project uses Tailwind CSS v4 which resolves theme values
 * from the `@theme` block in globals.css. This file documents the
 * custom design tokens for reference and tooling support.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        card: "#16161f",
        border: "#2a2a3a",
        foreground: "#e2e2f0",
        muted: "#8888a8",
        accent: {
          purple: "#7c6aff",
          pink: "#ff6a8a",
          teal: "#6affd4",
        },
      },
      fontFamily: {
        heading: ["var(--font-syne)", "Syne", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-syne)", "Syne", "ui-sans-serif", "system-ui"],
        mono: [
          "var(--font-jetbrains-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
