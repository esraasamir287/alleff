/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#12124A',
          50: '#eef0ff',
          100: '#d9dcff',
          200: '#b3b9ff',
          300: '#8e96ff',
          400: '#6973ff',
          500: '#4450ff',
          600: '#1f2dff',
          700: '#12124A',
          800: '#0e0e3a',
          900: '#090924',
        },
        secondary: {
          DEFAULT: '#6C35C9',
          50: '#f6f2ff',
          100: '#ede4ff',
          200: '#dcc9ff',
          300: '#c9aaff',
          400: '#b485ff',
          500: '#9d63ff',
          600: '#8a47f5',
          700: '#6C35C9',
          800: '#5a2da6',
          900: '#482680',
        },
        accent: {
          DEFAULT: '#F4C542',
          light: '#f9d97a',
          dark: '#d9a82e',
        },
        soft: '#F6F2FF',
        lavender: '#E8DDFB',
        ink: '#16162D',
        muted: '#66667A',
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#1da851',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 10px 40px -15px rgba(108, 53, 201, 0.18)',
        'soft-lg': '0 25px 60px -20px rgba(18, 18, 74, 0.22)',
      },
    },
  },
  plugins: [],
};
