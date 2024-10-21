export default {
  '**/*.ts': (filenames) => [
    'tsc -p tsconfig.json --noEmit',
    `prettier --check ${filenames.join(' ')}`,
    `eslint --max-warnings 0 --no-warn-ignored ${filenames.join(' ')}`,
    'vitest run',
  ],
};
