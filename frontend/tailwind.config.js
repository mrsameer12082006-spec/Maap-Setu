/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Institutional & Engineering Color Palette
        deepBlue: {
          DEFAULT: '#102A43', // Trust & Authority
          dark: '#0A1C2E',
          surface: '#1E3E61',
        },
        copper: {
          DEFAULT: '#C2672B', // Precision & Industry (Warm Copper)
          bronze: '#B85D19', // Warm Bronze
          dark: '#A5531E',
          light: '#D97736',
          tint: '#FDF3EC',
        },
        offWhite: {
          DEFAULT: '#FBF9F5', // Clarity & Measurement (Technical Schematics)
          surface: '#F5F1E8',
          border: '#E5E0D6',
        },
        complexNavy: '#102A43',
        complexNavyDark: '#0A1C2E',
        complexTeal: '#B85D19',
        complexAqua: '#C2672B',
        complexLightAqua: '#FDF3EC',
        complexPaper: '#FBF9F5',
        complexBeige: '#F1E8E2',
        complexCardRed: '#F9ECEB',
        complexCardYellow: '#FAF3E0',
        complexCardBlue: '#EBF1F7',
        primary: {
          DEFAULT: '#0B315B',
          dark: '#082342',
          light: '#EBF2F8',
        },
        copper: {
          DEFAULT: '#C87541',
          bronze: '#B85D19',
          light: '#D97736',
          tint: '#FDF3EC',
        },
        accent: {
          DEFAULT: '#C87541',
          dark: '#B85D19',
          light: '#FDF3EC',
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
        sans: ['"Instrument Sans"', '"Public Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      borderRadius: {
        card: '6px',
        button: '6px',
        input: '6px',
        md: '6px',
        sm: '4px',
      },
    },
  },
  plugins: [],
};
