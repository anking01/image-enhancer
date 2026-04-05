/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080b0f',
          secondary: '#0d1117',
          card: '#111827',
          elevated: '#161d2b',
        },
        accent: {
          cyan: '#00e5ff',
          purple: '#7c4dff',
          'cyan-dim': '#00b4cc',
          'purple-dim': '#5c35cc',
        },
        surface: {
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.05)',
        }
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0,229,255,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0,229,255,0.6)' },
        }
      }
    },
  },
  plugins: [],
}
