/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1C21', sub: '#737580', line: '#D9DBE0', mid: '#B8BAC2', soft: '#F2F2F5',
        accent: '#2961F2', accentSoft: '#E8F0FF', doc: '#16A34A', docSoft: '#ECFDF3', num: '#7C3AED', numSoft: '#F3EEFF',
      },
      fontFamily: { sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
