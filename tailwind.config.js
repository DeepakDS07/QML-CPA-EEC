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
          start: '#0A0E1A',
          via: '#0E1222',
          end: '#12172B',
        },
        quantum: {
          indigo: '#6366F1',
          violet: '#A855F7',
          emerald: '#10B981',
          teal: '#14B8A6',
          rose: '#F43F5E',
          orange: '#FB923C',
          slate: '#94A3B8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Space Grotesk', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'quantum-glow': '0 0 24px rgba(99, 102, 241, 0.4)',
        'quantum-card': '0 8px 32px 0 rgba(99, 102, 241, 0.08)',
        'emerald-glow': '0 0 16px rgba(16, 185, 129, 0.3)',
        'rose-glow': '0 0 16px rgba(244, 63, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
