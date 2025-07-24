/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#22c55e",
      },
    },
  },

  plugins: [
    require('tailwind-scrollbar-hide')
  ]
  
};
