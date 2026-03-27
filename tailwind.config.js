/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'glass-primary': "var(--glass-primary)",
        'glass-border': "var(--glass-border)",
        'glass-highlight': "var(--glass-highlight)",
        'matte-surface': "var(--matte-surface)",
        'matte-frost': "var(--matte-frost)",
        'accent-glow': "var(--accent-glow)",
        'accent-secondary': "var(--accent-secondary)",
        'deep-bg': "var(--deep-bg)"
      },
      fontFamily: {
        sans: ["Inter Variable", "sans-serif"],
      }
    },
  },
  plugins: [],
}
