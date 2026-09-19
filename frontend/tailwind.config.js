/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        complexNavy: '#003943',
        complexNavyDark: '#002B33',
        complexTeal: '#00959C',
        complexAqua: '#02B7BF',
        complexLightAqua: '#E0F5F6',
        complexPaper: '#FDF9F6',
        complexBeige: '#F1E8E2',
        complexCardRed: '#F9ECEB',
        complexCardYellow: '#FAF3E0',
        complexCardBlue: '#EAF6F8',
        primary: {
          DEFAULT: '#0F4C81',
          dark: '#0A3459',
          light: '#E6EEF5',
        },
        accent: {
          DEFAULT: '#0F8A65',
        },
        warning: {
          DEFAULT: '#B7791F',
        },
        danger: {
          DEFAULT: '#B33A3A',
        },
        neutral: {
          900: '#1A1D21',
          600: '#5B6470',
          300: '#D5D9DE',
          100: '#F4F6F8',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', '"Noto Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"PT Serif"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '16px',
        button: '8px',
        input: '8px',
      }
    },
  },
  plugins: [],
};
