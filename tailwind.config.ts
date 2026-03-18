import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF6F0',
          100: '#F5EFE5',
          200: '#E8DECC',
          300: '#DBCDB2',
          400: '#D9C7A5',
          500: '#C5A572',
          600: '#B89452',
          700: '#9B7A42',
          800: '#7E6235',
          900: '#6B5129',
        },
        warm: {
          50: '#FFFBF7',
          100: '#F5F0E8',
          200: '#EAE4D8',
          300: '#DFD8C8',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        base: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
