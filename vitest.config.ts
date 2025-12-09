import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.ts',
        '**/*.d.ts',
        'src/org-chart/generated_org_data.json'
      ]
    },
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist']
  }
})
