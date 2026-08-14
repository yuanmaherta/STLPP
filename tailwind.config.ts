import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Palet STLPP — navy + emas, bukan biru/abu Tailwind default
        navy: {
          50: "#EEF1F6",
          100: "#D6DDE9",
          200: "#AEBBD3",
          300: "#8698B9",
          400: "#5E769F",
          500: "#3D5A82",
          600: "#2F5D9A",
          700: "#233A5E",
          800: "#1B2C48",
          900: "#16233F",
          950: "#0F1830",
        },
        gold: {
          50: "#FBF6EB",
          100: "#F5E9CC",
          200: "#EBD39A",
          300: "#DFBD6E",
          400: "#D4A24C",
          500: "#C99A3D",
          600: "#AD7F2E",
          700: "#8A6423",
        },
        canvas: "#F7F8FA",
      },
      fontFamily: {
        display: [
          '"Segoe UI Variable Display"', '"Segoe UI"', 'ui-sans-serif', '-apple-system',
          'BlinkMacSystemFont', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
        sans: [
          'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"',
          'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(22, 35, 63, 0.04), 0 1px 3px 0 rgba(22, 35, 63, 0.06)",
        "card-hover": "0 4px 12px 0 rgba(22, 35, 63, 0.08), 0 2px 4px 0 rgba(22, 35, 63, 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
