import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import assert from 'assert';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { Kind } from 'graphql';
import * as path from 'path';
import * as prettier from 'prettier';
import { vi } from 'vitest';

vi.mock('graphql-request', (importActual) => {
  interface GraphQLClient {
    url: string;
    new (url: string): this;
    request(query: TypedDocumentNode<any, any>, variables: Record<string, any>): Promise<unknown>;
  }

  function GraphQLClient(this: GraphQLClient, url: string) {
    const mapped = {
      'https://chainflap-explor.org/graphql':
        'https://explorer-service-processor.chainflip.io/graphql',
      'https://chainflap-lp.org/graphql': 'https://lp-service.mainnet.chainflip.io/graphql',
    }[url];

    assert(mapped, `Unknown URL: ${url}`);

    this.url = mapped;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  GraphQLClient.prototype.request = vi.fn(async function (
    this: GraphQLClient,
    query: TypedDocumentNode<any, any>,
    variables: Record<string, any>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const { default: request } = (await importActual()) as typeof import('graphql-request');
    const sha1 = (str: string) => createHash('sha1').update(str).digest('hex').slice(0, 6);
    const queryHash = sha1(JSON.stringify(query));
    const variablesHash = sha1(JSON.stringify(variables));

    const fixturesDir = path.join(import.meta.dirname, '__fixtures__');
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
    await fs.writeFile(cachedFile, await prettier.format(JSON.stringify(result)), 'utf8');

    return result;
  });

  return { GraphQLClient };
});
