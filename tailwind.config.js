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
          surface: '#FFFFFF',
          secondary: '#F0F1E9',
          text: '#1D2923',
          textSecondary: '#777E77',
          textMuted: '#9A9F98',
          olive: '#244C3B',
          oliveDark: '#1D3D30',
          oliveSecondary: '#466B56',
          sage: '#A6B6A1',
          lightSage: '#E5EBDD',
          border: '#E6E5DC',
          income: '#39845B',
          expense: '#DB896B',
          warning: '#D6A45E',
          error: '#C76B63',
        }
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'DM Serif Display', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-mono)', 'IBM Plex Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(29, 41, 35, 0.04), 0 1px 2px -1px rgba(29, 41, 35, 0.03)',
        'card': '0 4px 6px -1px rgba(29, 41, 35, 0.03), 0 2px 4px -2px rgba(29, 41, 35, 0.03)',
        'dropdown': '0 10px 15px -3px rgba(29, 41, 35, 0.06), 0 4px 6px -4px rgba(29, 41, 35, 0.04)',
      }
    },
  },
  plugins: [],
};
