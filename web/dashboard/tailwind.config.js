/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F19",
        cardBg: "#111827",
        borderBg: "#1F2937",
        accentBlue: "#38BDF8",
        accentGreen: "#10B981"
      }
    },
  },
  plugins: [],
}
