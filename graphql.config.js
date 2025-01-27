/** @type {import ('@graphql-codegen/cli').CodegenConfig} */
const config = {
  schema: [
    {
      // 'http://localhost:4001/graphql': {},
      // 'https://chainflip-cache.staging/graphql': {},
      'https://chainflip-cache-backspin.staging/graphql': {},
    },
    {
      'http://localhost:3001/graphql': {},
      // 'https://processor.staging/graphql': {},
      // 'https://processor-backspin.staging/graphql': {},
    },
    {
      // 'https://chainflip-lp-service.sisyphos.staging/graphql': {},
      'https://chainflip-lp-service.backspin.staging/graphql': {},
    },
  ],
  documents: ['src/**/*.ts'],
  emitLegacyCommonJSImports: false,
  hooks: { afterAllFileWrite: ['prettier --write'] },
  generates: {
    'src/graphql/generated/': {
      preset: 'client-preset',
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false,
      },
      config: {
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
          Datetime: 'string',
          Decimal: 'string',
          BigInt: 'string',
          BigFloat: 'string',
        },
      },
    },
  },
};

export default config;
