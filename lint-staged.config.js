export default {
  '**/*.ts': (filenames) => [
    'tsc -p tsconfig.json --noEmit',
    `prettier --write ${filenames.join(' ')} --check`,
    `eslint --max-warnings 0 --no-warn-ignored ${filenames.join(' ')}`,
  ],
};
