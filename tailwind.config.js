/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        animation: {
            'combo-pop': 'comboPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            'badge-reveal': 'badgeReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            'shine': 'shine 3s infinite',
            'slideUp': 'slideUp 0.5s ease-out',
            'fadeIn': 'fadeIn 0.5s ease-out',
        },
        keyframes: {
            comboPop: {
                '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0' },
                '50%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '1' },
                '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0' },
            },
            badgeReveal: {
                '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
                '60%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
                '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
            },
            shine: {
                '0%': { left: '-100%' },
                '100%': { left: '200%' },
            },
            slideUp: {
                'from': { opacity: '0', transform: 'translateY(20px)' },
                'to': { opacity: '1', transform: 'translateY(0)' },
            },
            fadeIn: {
                'from': { opacity: '0' },
                'to': { opacity: '1' },
            }
        }
    },
  },
  plugins: [],
}
