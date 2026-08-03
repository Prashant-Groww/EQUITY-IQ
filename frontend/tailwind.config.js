/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F17',
          card: '#131A29',
          border: '#1E293B',
          accent: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
};
