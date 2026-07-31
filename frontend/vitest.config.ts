import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 35,
        functions: 30,
        statements: 35,
        branches: 25
      },
      exclude: ['node_modules/', 'dist/']
    }
  }
});
