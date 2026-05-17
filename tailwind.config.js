/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          lighter: "hsl(var(--primary-lighter))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          darker: "hsl(var(--primary-darker))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },

        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
      },
      backgroundImage: {
        "earnings-bg": "url('/images/earnings-bg.svg')",
        union: "url('/union.svg')",
        "primary-gradient-8":
          "linear-gradient(135deg, rgba(107, 55, 212, 0.08) 0%, rgba(107, 55, 212, 0.04) 100%)",
        "primary-gradient-12":
          "linear-gradient(135deg, rgba(107, 55, 212, 0.12) 0%, rgba(107, 55, 212, 0.06) 100%)",
        "primary-gradient-16":
          "linear-gradient(135deg, rgba(107, 55, 212, 0.16) 0%, rgba(107, 55, 212, 0.08) 100%)",
        "primary-gradient-20":
          "linear-gradient(135deg, rgba(107, 55, 212, 0.20) 0%, rgba(107, 55, 212, 0.10) 100%)",
        "primary-gradient-24":
          "linear-gradient(135deg, rgba(107, 55, 212, 0.24) 0%, rgba(107, 55, 212, 0.12) 100%)",
        "primary-gradient-32":
          "linear-gradient(135deg, rgba(107, 55, 212, 0.32) 0%, rgba(107, 55, 212, 0.16) 100%)",
        "primary-gradient-48":
          "linear-gradient(135deg, rgba(107, 55, 212, 0.48) 0%, rgba(107, 55, 212, 0.24) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
