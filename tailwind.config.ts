import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Industrial Premium Dark Theme
        background: {
          primary: '#0A0E14',
          secondary: '#0F172A',
          tertiary: '#1E293B',
        },
        brand: {
          primary: '#22C55E',
          secondary: '#16A34A',
          tertiary: '#15803D',
        },
        text: {
          primary: '#E4E7EB',
          secondary: '#94A3B8',
          tertiary: '#64748B',
        },
        border: {
          primary: 'rgba(71, 85, 105, 0.2)',
          secondary: 'rgba(71, 85, 105, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'ticker-scroll': 'ticker-scroll 30s linear infinite',
      },
      keyframes: {
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
