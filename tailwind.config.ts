import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#faf7fe',
          100: '#f3edfc',
          200: '#e9defa',
          300: '#d7c3f5',
          400: '#bf9ded',
          500: '#a374e3',
          600: '#8a52d4',
          700: '#7441b9',
          800: '#613898',
          900: '#50307b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
