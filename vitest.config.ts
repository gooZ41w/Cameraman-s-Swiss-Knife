import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'],
  },
})
