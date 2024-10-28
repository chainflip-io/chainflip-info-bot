import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/__mocks__/setup.ts'],
    restoreMocks: true,
    include: ['./src/**/*.test.ts', './src/**/*.test.tsx'],
    coverage: {
      enabled: true,
      exclude: ['**/__tests__/**', './**/*.js', '**/__mocks__/**'],
    },
  },
});
