/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        desert: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          accent: '#06B6D4',
          warning: '#F59E0B',
          danger: '#EF4444',
          success: '#10B981',
          super: '#38BDF8'
        }
      }
    },
  },
  plugins: [],
}
