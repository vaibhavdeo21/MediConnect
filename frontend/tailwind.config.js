/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f766e",
        secondary: "#0e7490", 
        accent: "#f59e0b",
      },
    },
  },
  plugins: [],
}