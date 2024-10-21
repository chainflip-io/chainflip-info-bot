export default {
  '**/*.ts': (filenames) => [
    'tsc -p tsconfig.json --noEmit',
    `prettier --write ${filenames.join(' ')} --check`,
  ],
};
