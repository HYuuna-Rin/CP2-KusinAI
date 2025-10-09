/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7BB661",     // Fresh Basil Green – main brand color
        accent: "#F4A261",      // Warm Orange – buttons & highlights
        background: "#FFF8F0",  // Soft Rice White – app background
        surface: "#F2CC8F",     // Latte Beige – cards, modals
        text: "#3D2C2E",        // Cocoa Brown – main text
        leaf: "#5B8C5A",        // Banana Leaf Green – accent/hover
        tamarind: "#9E6F43",    // Warm Brown – footer/deep accents
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
