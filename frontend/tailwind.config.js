/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c0c0ff',
          300: '#9999ee',
          400: '#6666cc',
          500: '#4444aa',
          600: '#3333aa',
          700: '#2222bb',
          800: '#0000ff',
          900: '#0000cc',
        },
        accent: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#b0b0ff',
          300: '#8080ff',
          400: '#5050ff',
          500: '#0000ff',
          600: '#0000dd',
          700: '#0000bb',
          800: '#000099',
          900: '#000077',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
