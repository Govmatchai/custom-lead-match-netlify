/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hvac-orange': '#FF6B35',
        'hvac-blue': '#0066CC'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
