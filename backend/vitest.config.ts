import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 40,
        functions: 40,
        statements: 40,
        branches: 30
      },
      exclude: ['node_modules/', 'dist/', 'tests/fixtures/']
    }
  }
});
