import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#D9F8F6',
          100: '#B3F1ED',
          200: '#80E8E1',
          500: '#00CEC0',
          600: '#00A59A',
          700: '#007A72',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        float: '0 4px 24px rgba(0, 206, 192, 0.30)',
      },
    },
  },
  plugins: [],
};
export default config;
