import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Responsive sidebar & layout
    'lg:ml-60',
    'lg:hidden',
    'lg:translate-x-0',
    '-translate-x-full',
    'translate-x-0',
    'transition-transform',
    'duration-300',
    'ease-in-out',
    'pt-14',
    'lg:pt-0',
    'sm:p-6',
    'lg:p-8',
    'z-40',
    'z-20',
    'bg-black/60',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
