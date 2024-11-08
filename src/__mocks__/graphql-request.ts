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

  /**
   * using some "old skool" inheritance to:
   * 1. allow for a default mock to be used
   * 2. allow for seamless mocking of the request method without having to spy on it
   *
   * i tried with `class` but then it required spying on the request method or
   * mocking the entire class, which is fine, but this is easier
   */
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
    // hash function that keeps only the first 6 characters, should be unique enough
    // for our use case to avoid collisions
    const sha1 = (str: string) => createHash('sha1').update(str).digest('hex').slice(0, 6);
    // hash the query to make a unique directory
    const queryHash = sha1(JSON.stringify(query));
    // hash the variables to make a unique filename
    const variablesHash = sha1(JSON.stringify(variables));

    const fixturesDir = path.join(import.meta.dirname, '__fixtures__');
    assert(query.kind === Kind.DOCUMENT, 'Expected query to be a Document');
    const [def] = query.definitions;
    assert(def.kind === Kind.OPERATION_DEFINITION, 'Expected query to be an OperationDefinition');
    assert(def.name, 'Expected query to have a name');
    const name = def.name.value;
    const cachedFile = path.join(fixturesDir, `${name}-${queryHash}`, `${variablesHash}.json`);
    // check for cached file
    const file = await fs.readFile(cachedFile, 'utf8').catch(() => null);

    // return the cached response if it exists
    if (file) return JSON.parse(file) as unknown;

    // otherwise, make the request
    const result = (await request(this.url, query, variables)) as unknown;

    await fs.mkdir(path.dirname(cachedFile), { recursive: true });
    // and then cache the response
    await fs.writeFile(
      cachedFile,
      await prettier.format(JSON.stringify(result), { parser: 'json' }),
      'utf8',
    );

    return result;
  });

  return { GraphQLClient };
});
