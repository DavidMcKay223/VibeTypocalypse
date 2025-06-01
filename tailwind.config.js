/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-dark': '#1a1a2e',
        'game-accent': '#4ade80',
      },
    },
  },
  plugins: [],
} 