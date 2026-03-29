/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
    },
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        border: 'var(--color-border)',
        success: '#15803d',
        warning: '#b45309',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
