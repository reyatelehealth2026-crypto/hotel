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
        sidebar: {
          DEFAULT: '#0B2D1E',
          hover: '#143D2A',
          active: '#1B5236',
          border: '#1A3D27',
          text: '#A8C4B4',
        },
        brand: {
          50:  '#FFF8E7',
          100: '#FFF0C2',
          200: '#FFE08A',
          400: '#F5A800',
          500: '#C9882A',
          600: '#A86E1A',
          700: '#855410',
        },
        jade: {
          50:  '#EDFAF3',
          100: '#D0F3E3',
          500: '#1A7A4A',
          600: '#14633B',
        },
        warm: {
          bg:     '#FFFBF5',
          card:   '#FFFFFF',
          border: '#EDE4D6',
          muted:  '#F7F2EA',
        },
      },
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
        display: ['Trirong', 'serif'],
      },
      boxShadow: {
        warm: '0 1px 3px rgba(180,120,40,0.08), 0 1px 2px rgba(180,120,40,0.06)',
        'warm-md': '0 4px 16px rgba(180,120,40,0.10), 0 2px 4px rgba(180,120,40,0.06)',
        'warm-lg': '0 8px 32px rgba(180,120,40,0.12), 0 4px 8px rgba(180,120,40,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
