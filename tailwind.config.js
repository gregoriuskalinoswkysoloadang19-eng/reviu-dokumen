/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // DRES brand — deep civic blue paired with an emerald accent,
        // continuing the Inspektorat's existing blue/green identity.
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          300: '#8bb0ff',
          400: '#5285f7',
          500: '#2b60ea',
          600: '#1d47cf',
          700: '#1a3aa8',
          800: '#182f83',
          900: '#16295f',
          950: '#0d1836',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a4f4cc',
          300: '#6ce8ac',
          400: '#38d18a',
          500: '#17b271',
          600: '#0e9260',
          700: '#0d754f',
          800: '#0d5c40',
          900: '#0b4b36',
        },
        // Semantic status tokens shared by every module going forward
        success: { subtle: '#e9f9ef', DEFAULT: '#16a34a', strong: '#0f6e33' },
        warning: { subtle: '#fef6e7', DEFAULT: '#d97706', strong: '#8a4c04' },
        danger: { subtle: '#fdeeee', DEFAULT: '#dc2626', strong: '#961c1c' },
        info: { subtle: '#eaf1ff', DEFAULT: '#2563eb', strong: '#1a3f9e' },
        neutral: { subtle: '#f3f4f6', DEFAULT: '#6b7280', strong: '#374151' },
        // Surface tokens driven by CSS variables so light/dark stay in sync
        surface: {
          canvas: 'var(--surface-canvas)',
          base: 'var(--surface-base)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          sunken: 'var(--surface-sunken)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        ink: {
          primary: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          tertiary: 'var(--ink-tertiary)',
          inverse: 'var(--ink-inverse)',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        'soft-xs': '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'soft-sm': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
        'soft-md': '0 4px 12px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
        'soft-lg': '0 12px 24px -6px rgba(16, 24, 40, 0.10), 0 4px 8px -2px rgba(16, 24, 40, 0.05)',
        'soft-xl': '0 20px 40px -8px rgba(16, 24, 40, 0.14)',
        glass: '0 8px 32px 0 rgba(13, 24, 54, 0.10)',
        'focus-ring': '0 0 0 3px rgba(43, 96, 234, 0.25)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.97)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 150ms ease-out',
        shimmer: 'shimmer 1.6s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
