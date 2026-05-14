import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        ink: 'oklch(var(--color-ink) / <alpha-value>)',
        mist: 'oklch(var(--color-mist) / <alpha-value>)',
        moss: 'oklch(var(--color-moss) / <alpha-value>)',
        jade: 'oklch(var(--color-jade) / <alpha-value>)',
        porcelain: 'oklch(var(--color-porcelain) / <alpha-value>)',
        ember: 'oklch(var(--color-ember) / <alpha-value>)',
        rice: 'oklch(var(--color-rice) / <alpha-value>)',
        lacquer: 'oklch(var(--color-lacquer) / <alpha-value>)',
        bamboo: 'oklch(var(--color-bamboo) / <alpha-value>)'
      },
      boxShadow: {
        soft: '0 2px 8px oklch(21% 0.028 154 / 0.1)',
        tile: '0 10px 22px oklch(21% 0.028 154 / 0.12), inset 0 -2px 0 oklch(21% 0.028 154 / 0.08)'
      }
    }
  }
}
