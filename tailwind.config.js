/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
        'dark-tertiary': '#3a3a3a',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
      }
    },
  },
  plugins: [],
};