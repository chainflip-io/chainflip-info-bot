import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    restoreMocks: true,
    include: ['**/*.test.ts'],
    coverage: {
      enabled: true,
    },
  },
});
