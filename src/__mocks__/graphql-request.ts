import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import assert from 'assert';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { Kind } from 'graphql';
import * as path from 'path';
import { vi } from 'vitest';

vi.mock('graphql-request', (importActual) => {
  class GraphQLClient {
    private readonly url: string;

    constructor(url: string) {
      const mapped = {
        'https://chainflap-explor.org/graphql':
          'https://explorer-service-processor.chainflip.io/graphql',
        'https://chainflap-lp.org/graphql': 'https://lp-service.mainnet.chainflip.io/graphql',
      }[url];

      assert(mapped, `Unknown URL: ${url}`);

      this.url = mapped;
    }

    async request(query: TypedDocumentNode<any, any>, variables: Record<string, any>) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const { default: request } = (await importActual()) as typeof import('graphql-request');
      const sha1 = (str: string) => createHash('sha1').update(str).digest('hex');
      const queryHash = sha1(JSON.stringify(query));
      const variablesHash = sha1(JSON.stringify(variables));

      const fixturesDir = path.join(import.meta.dirname, '__fixtures__');
      // const name = query.definitions[0].
      assert(query.kind === Kind.DOCUMENT, 'Expected query to be a Document');
      const [def] = query.definitions;
      assert(def.kind === Kind.OPERATION_DEFINITION, 'Expected query to be an OperationDefinition');
      assert(def.name, 'Expected query to have a name');
      const name = def.name.value;
      const cachedFile = path.join(fixturesDir, `${name}-${queryHash}`, `${variablesHash}.json`);
      const file = await fs.readFile(cachedFile, 'utf8').catch(() => null);

      if (file) return JSON.parse(file) as unknown;

      const result = (await request(this.url, query, variables)) as unknown;

      await fs.mkdir(path.dirname(cachedFile), { recursive: true });
      await fs.writeFile(cachedFile, JSON.stringify(result, null, 2), 'utf8');

      return result;
    }
  }

  return { GraphQLClient };
});
