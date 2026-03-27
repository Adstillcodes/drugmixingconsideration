/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "secondary-container": "#FFD6C2",
        "surface-container-low": "#FFF9F0",
        "surface": "#FFFBF7",
        "surface-container-high": "#FDEEDC",
        "primary-container": "#F4A261",
        "on-surface-variant": "#4E463F",
        "on-tertiary-fixed-variant": "#6f3814",
        "on-secondary-container": "#7D3D2E",
        "on-surface": "#2D2825",
        "primary": "#E76F51",
        "background": "#FFFBF7",
        "outline-variant": "#E8DED3",
        "tertiary": "#E9C46A",
        "error": "#D32F2F",
        "error-container": "#FFEBEE",
        "success": "#2ECC71",
      },
      fontFamily: {
        "headline": ["Lexend", "sans-serif"],
        "body": ["Lexend", "sans-serif"],
        "label": ["Lexend", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px",
      },
      animation: {
        'soft-pulse': 'soft-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'soft-pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.95, transform: 'scale(0.99)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
