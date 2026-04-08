/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:   '#FAFAF8',
        white:   '#FFFFFF',
        stone: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#F5EDD5',
          hover:   '#B8960A',
          dim:     'rgba(201,168,76,0.12)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        lift:  '0 4px 16px rgba(0,0,0,0.08)',
        gold:  '0 2px 12px rgba(201,168,76,0.25)',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease',
        'slide-up':  'slideUp 0.3s ease',
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-gold':'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:   { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.3)' }, '50%': { boxShadow: '0 0 0 8px rgba(201,168,76,0)' } },
      },
    },
  },
  plugins: [],
}
