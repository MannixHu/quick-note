import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Primary - Deep Indigo
        primary: {
          50: 'hsl(234, 89%, 97%)',
          100: 'hsl(234, 89%, 94%)',
          200: 'hsl(234, 89%, 86%)',
          300: 'hsl(234, 89%, 74%)',
          400: 'hsl(234, 89%, 62%)',
          500: 'hsl(234, 89%, 50%)',
          600: 'hsl(234, 89%, 42%)',
          700: 'hsl(234, 89%, 34%)',
          800: 'hsl(234, 89%, 26%)',
          900: 'hsl(234, 89%, 18%)',
          950: 'hsl(234, 89%, 10%)',
        },
        // Accent - Warm Gold
        accent: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          subtle: 'hsl(38, 80%, 60%)',
        },
        // Surface colors
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        xs: '0 1px 2px hsl(0 0% 0% / 0.05)',
        sm: '0 1px 3px hsl(0 0% 0% / 0.1), 0 1px 2px hsl(0 0% 0% / 0.06)',
        md: '0 4px 6px hsl(0 0% 0% / 0.1), 0 2px 4px hsl(0 0% 0% / 0.06)',
        lg: '0 10px 15px hsl(0 0% 0% / 0.1), 0 4px 6px hsl(0 0% 0% / 0.05)',
        xl: '0 20px 25px hsl(0 0% 0% / 0.1), 0 10px 10px hsl(0 0% 0% / 0.04)',
        '2xl': '0 25px 50px hsl(0 0% 0% / 0.25)',
        primary: '0 10px 40px hsl(234 89% 50% / 0.2)',
        glow: '0 0 40px hsl(234 89% 50% / 0.3)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0, 0, 0.2, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.2s cubic-bezier(0, 0, 0.2, 1)',
        shimmer: 'shimmer 2s infinite',
        gradient: 'gradient-shift 8s ease infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        snappy: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        mesh: `
          radial-gradient(at 40% 20%, hsl(234 89% 60% / 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsl(280 60% 60% / 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsl(180 60% 60% / 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 50%, hsl(340 60% 60% / 0.08) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsl(234 89% 60% / 0.12) 0px, transparent 50%)
        `,
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

export default config
