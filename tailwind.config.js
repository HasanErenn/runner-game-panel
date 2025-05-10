/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#8A2BE2',
        'neon-blue': '#1E90FF',
        'neon-green': '#39FF14',
        'dark': '#121212',
        'dark-light': '#1e1e1e',
      },
      boxShadow: {
        'neon': '0 0 20px',
      },
    },
  },
  plugins: [],
} 