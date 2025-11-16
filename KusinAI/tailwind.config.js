/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fresh & Professional palette
        primary: "#4CAF50",       // Fresh Green – navbar, primary actions
        accent: "#FF8A42",        // Warm Tangerine – CTAs, highlights
        background: "#FAFAF5",    // Off-white – app background
        surface: "#FFF8EE",       // Very light warm beige – cards, modals
        text: "#2E2E2E",          // Dark charcoal – main text
        leaf: "#2E7D32",          // Dark green – links/hover
        tamarind: "#8B5E34",      // Warm neutral brown – subtle accents
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
