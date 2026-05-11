/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#04040A',
          900: '#0A0A12',
          800: '#111120',
          700: '#1A1A2E',
          600: '#252540',
        },
        amber: {
          DEFAULT: '#F5A623',
          50:  '#FFF8EB',
          100: '#FFEFC9',
          200: '#FFD980',
          300: '#FFC347',
          400: '#F5A623',
          500: '#E08A00',
          600: '#B86D00',
        },
        ice: {
          DEFAULT: '#F8F9FF',
          50:  '#FFFFFF',
          100: '#F8F9FF',
          200: '#E8EAFF',
          300: '#C5C9E8',
          400: '#9299C4',
          500: '#6670A0',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'shimmer':    'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow:    { '0%': { boxShadow: '0 0 20px rgba(245,166,35,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(245,166,35,0.6)' } },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'grid-pattern': "linear-gradient(rgba(245,166,35,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.03) 1px, transparent 1px)",
        'amber-radial': 'radial-gradient(ellipse at center, rgba(245,166,35,0.15) 0%, transparent 70%)',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
