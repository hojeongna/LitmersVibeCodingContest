import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Semantic colors
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        // Priority colors
        priority: {
          high: {
            bg: "hsl(var(--priority-high-bg))",
            text: "hsl(var(--priority-high-text))",
          },
          medium: {
            bg: "hsl(var(--priority-medium-bg))",
            text: "hsl(var(--priority-medium-text))",
          },
          low: {
            bg: "hsl(var(--priority-low-bg))",
            text: "hsl(var(--priority-low-text))",
          },
        },
        // Kanban column colors
        column: {
          backlog: "hsl(var(--column-backlog))",
          progress: "hsl(var(--column-progress))",
          review: "hsl(var(--column-review))",
          done: "hsl(var(--column-done))",
        },
        // Label colors
        label: {
          bug: {
            bg: "hsl(var(--label-bug-bg))",
            text: "hsl(var(--label-bug-text))",
          },
          feature: {
            bg: "hsl(var(--label-feature-bg))",
            text: "hsl(var(--label-feature-text))",
          },
          enhancement: {
            bg: "hsl(var(--label-enhancement-bg))",
            text: "hsl(var(--label-enhancement-text))",
          },
          docs: {
            bg: "hsl(var(--label-docs-bg))",
            text: "hsl(var(--label-docs-text))",
          },
        },
        // Sidebar specific
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          muted: "hsl(var(--sidebar-muted))",
          hover: "hsl(var(--sidebar-hover))",
          active: "hsl(var(--sidebar-active))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        sidebar: "240px",
        "sidebar-collapsed": "60px",
      },
      backgroundImage: {
        "ai-gradient": "linear-gradient(135deg, #5B5FC7 0%, #3B82F6 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
