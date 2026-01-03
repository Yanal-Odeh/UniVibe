/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          light: '#3b82f6',
          dark: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        accent: '#f59e0b',
        background: '#f8fafc',
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
        }
      },
    },
  },
  plugins: [],
}