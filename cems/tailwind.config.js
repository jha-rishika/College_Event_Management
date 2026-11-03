/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sky: { DEFAULT: '#bedeff', 50: '#f1f8ff', 100: '#e3f1ff', 200: '#bedeff', 300: '#9ccbff' },
        pink: { DEFAULT: '#ff2a7f', dark: '#e01468', soft: '#ffe3ee' },
        amber: { DEFAULT: '#ffa500', dark: '#d98900', soft: '#fff0d1' },
        wine: { DEFAULT: '#930031', dark: '#6e0024', light: '#b3254f', soft: '#f6dde4' },
        ink: { DEFAULT: '#241a22', soft: '#5d5160', mute: '#8b8190' },
        line: '#d3e2f2',
        ok: { DEFAULT: '#1f8a5b', soft: '#dcf2e7' },
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(36,26,34,.06), 0 2px 8px rgba(36,26,34,.04)',
        pop: '0 12px 40px rgba(36,26,34,.22)',
      },
    },
  },
  plugins: [],
};
