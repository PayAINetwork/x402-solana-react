/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solana: {
          primary: '#9945FF',
          secondary: '#14F195',
          dark: '#000212',
          success: '#00D18C',
          error: '#FF6B6B',
          warning: '#FFB800',
        },
      },
      backgroundImage: {
        'solana-gradient': 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
        'solana-gradient-vertical': 'linear-gradient(180deg, #9945FF 0%, #14F195 100%)',
        'solana-gradient-radial': 'radial-gradient(circle, #9945FF 0%, #14F195 100%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
