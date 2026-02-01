/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#2C097F",
        "primary-dark": "#0a47c4",
        "primary-light": "#eef4ff",
        "background-light": "#f6f6f8",
        "background-dark": "#151022",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
      },
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
        korean: ['Noto Sans KR', 'sans-serif'], // Fallback to system fonts if Google blocked
        chinese: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'bounce-slight': 'bounce-slight 1s infinite',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        'bounce-slight': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
