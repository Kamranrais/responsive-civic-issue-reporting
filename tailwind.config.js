/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2fb',
          100: '#d5dff5',
          200: '#aabfeb',
          300: '#7f9fe1',
          400: '#547fd7',
          500: '#2960cd',
          600: '#1e4da4',
          700: '#163a7b',
          800: '#0e2752',
          900: '#1a2e5a',
          950: '#060f1f',
        },
        saffron: {
          50:  '#fff7ed',
          100: '#ffeed5',
          200: '#ffd9aa',
          300: '#ffbd74',
          400: '#ff9636',
          500: '#f97316',
          600: '#ea6c0a',
          700: '#c2580a',
          800: '#9a4710',
          900: '#7c3c10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
