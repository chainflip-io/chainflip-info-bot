import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/__tests__/__mocks__/setup.ts'],
    restoreMocks: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      enabled: true,
    },
  },
});
