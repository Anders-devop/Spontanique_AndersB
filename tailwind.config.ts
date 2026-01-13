import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "210 100% 95%",
          100: "210 100% 90%",
          200: "210 100% 80%",
          300: "210 100% 69%",
          400: "210 100% 60%",
          500: "210 100% 50%",
          600: "210 100% 40%",
          700: "210 100% 30%",
          800: "210 100% 20%",
          900: "210 100% 10%",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "0 86% 97%",
          100: "0 93% 94%",
          200: "0 96% 89%",
          300: "0 94% 82%",
          400: "0 91% 71%",
          500: "0 84% 60%",
          600: "0 72% 51%",
          700: "0 74% 42%",
          800: "0 70% 35%",
          900: "0 63% 31%",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        white: "#FFFFFF",
        spontaneous: {
          50: "210 100% 95%",
          100: "210 100% 90%",
          200: "210 100% 80%", 
          300: "210 100% 69%",
          400: "210 100% 60%",
          500: "210 100% 50%",
          600: "210 100% 40%",
          700: "210 100% 30%",
          800: "210 100% 20%",
          900: "210 100% 10%",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      zIndex: {
        '100': '100',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
