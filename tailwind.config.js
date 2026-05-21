/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8960C',
          dark:    '#A07808',
          light:   '#E8B020',
        },
        sidebar: '#2C2C2C',
      },
    },
  },
  plugins: [],
}
