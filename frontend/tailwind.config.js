/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gh-bg': '#0f0f10',
        'gh-surface': '#141415',
        'gh-elevated': '#19191b',
        'gh-border': 'rgba(255, 255, 255, 0.08)',
        'gh-border-strong': 'rgba(255, 255, 255, 0.14)',
        'gh-text': '#f2f2f3',
        'gh-muted': '#9898a0',
        'gh-subtle': '#686870',
        'gh-blue': '#38bdf8',
        'gh-purple': '#38bdf8',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
