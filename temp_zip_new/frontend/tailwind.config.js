/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Supports dark and light toggles
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b0f19',
          card: 'rgba(20, 26, 44, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#8b5cf6', // Violet Accent
          secondary: '#10b981', // Emerald Accent
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(139, 92, 246, 0.3)',
        'glow-secondary': '0 0 15px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
