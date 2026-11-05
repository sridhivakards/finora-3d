/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finora: {
          bg: '#F7F6F0',
          card: '#FFFFFF',
          cardHover: '#F0F1E9',
          border: '#E6E5DC',
          borderGlow: 'transparent',
          cyan: '#244C3B',
          cyanGlow: '#466B56',
          indigo: '#244C3B',
          violet: '#466B56',
          amber: '#A6B6A1',
          emerald: '#39845B',
          rose: '#DB896B',
          textMuted: '#777E77',
          textLight: '#1D2923',
        },
        olive: {
          DEFAULT: '#244C3B',
          dark: '#1D3D30',
          light: '#466B56',
        },
        sage: {
          DEFAULT: '#A6B6A1',
          light: '#E5EBDD',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(29, 41, 35, 0.04), 0 1px 2px -1px rgba(29, 41, 35, 0.03)',
      }
    },
  },
  plugins: [],
};
