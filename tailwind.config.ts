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
        charcoal: {
          50: '#F7F7F7',
          100: '#EFEFEF',
          200: '#DCDCDC',
          300: '#C9C9C9',
          400: '#A6A6A6',
          500: '#2D2D2D',
          600: '#282828',
          700: '#1F1F1F',
          800: '#1A1A1A',
          900: '#0D0D0D',
        },
        warm: {
          50: '#FFFBF7',
          100: '#F5F0E8',
          200: '#EAE4D8',
          300: '#DFD8C8',
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        base: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
};

export default config;
