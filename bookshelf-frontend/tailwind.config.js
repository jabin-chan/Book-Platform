/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50:  '#faf7f2',
          100: '#f5e6d3',
          200: '#e8d5c4',
          300: '#c9a882',
          400: '#9c7a5a',
          500: '#7a6355',
          600: '#6b4226',
          700: '#3d2b1f',
          800: '#2c1f16',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};