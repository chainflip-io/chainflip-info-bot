const schemas = {
  explorer: 'https://explorer-service-processor.chainflip.io/graphql',
  lp: 'https://lp-service.chainflip.io/graphql',
};

/** @type {import ('@graphql-codegen/cli').CodegenConfig} */
export default {
  emitLegacyCommonJSImports: false,
  hooks: { afterAllFileWrite: ['prettier --write'] },
  generates: Object.fromEntries(
    Object.entries(schemas).map(([key, schema]) => [
      `src/graphql/generated/${key}/`,
      {
        schema,
        documents: [`src/queries/${key}.ts`],

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
    ]),
  ),
};
