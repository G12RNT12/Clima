/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        weather: {
          'clear-day': {
            start: '#0c4a6e',
            mid: '#0284c7',
            end: '#38bdf8',
          },
          'clear-night': {
            start: '#060b19',
            mid: '#0f172a',
            end: '#1e1b4b',
          },
          cloudy: {
            start: '#1e293b',
            mid: '#334155',
            end: '#475569',
          },
          rain: {
            start: '#0f172a',
            mid: '#1e293b',
            end: '#334155',
          },
          snow: {
            start: '#1e3a5f',
            mid: '#3b6998',
            end: '#6495ed',
          },
          storm: {
            start: '#090d16',
            mid: '#1a162b',
            end: '#2e2640',
          },
          fog: {
            start: '#27303f',
            mid: '#3f4c5c',
            end: '#596778',
          },
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.22)',
        'glass-hover': '0 14px 38px 0 rgba(0, 0, 0, 0.30)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.22)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
