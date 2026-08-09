/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Dynamic surface palette mapped to CSS custom variables
        vg: {
          primary:        'var(--vg-bg-primary)',
          secondary:      'var(--vg-bg-secondary)',
          tertiary:       'var(--vg-bg-tertiary)',
          elevated:       'var(--vg-bg-elevated)',
          active:         'var(--vg-bg-active)',
          border:         'var(--vg-border-subtle)',
          'border-strong': 'var(--vg-border-strong)',
        },
        // Text hierarchy
        'text-primary':   'var(--vg-text-primary)',
        'text-secondary': 'var(--vg-text-secondary)',
        'text-muted':     'var(--vg-text-muted)',
        // Accent colors
        accent: {
          blue:   'var(--vg-accent)',
          purple: '#5e5ce6',
          teal:   '#64d2ff',
          red:    '#ff453a',
          green:  '#30d158',
          orange: '#ff9f0a',
        },
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'smooth':  'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.15s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.25s ease-in forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideDown: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
      borderRadius: {
        'card':   '12px',
        'button': '8px',
        'modal':  '20px',
      },
    },
  },
  plugins: [],
}
