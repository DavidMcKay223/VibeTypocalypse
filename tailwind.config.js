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
      keyframes: {
        shamble: {
          '0%, 100%': { transform: 'translate(-50%, -50%) rotate(-5deg)' },
          '50%': { transform: 'translate(-50%, -50%) rotate(5deg)' }
        },
        attack: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.2)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)' }
        },
        death: {
          '0%': { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) scale(0) rotate(90deg)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      animation: {
        'shamble': 'shamble 2s ease-in-out infinite',
        'attack': 'attack 0.5s ease-in-out',
        'death': 'death 1s ease-in-out',
        'pulse': 'pulse 0.2s ease-in-out'
      }
    },
  },
  plugins: [],
} 