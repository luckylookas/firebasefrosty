/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#2d3250',
        'main': '#424769',
        'light': '#7077A1',
        'accent': '#f6b17a',
        'text': '#E3E3E3',
        'red': '#660000aa',
        'green': '#004807aa',
        'blue': '#005c88aa',
        'purple': '#45004faa',
        'elite': '#ffbe0033'
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
