/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2e7d32',
        accent: '#f6c23e',
        background: '#FAFAF5',
        surface: '#f5e3c2',
        text: '#1f2937',
        leaf: '#4caf50',
        danger: '#dc2626'
      }
    },
  },
  plugins: [],
}
