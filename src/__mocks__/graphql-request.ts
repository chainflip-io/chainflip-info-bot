import assert from 'assert';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { type RequestDocument } from 'graphql-request';
import * as path from 'path';
import { vi } from 'vitest';

vi.mock('graphql-request', (importActual) => {
  class GraphQLClient {
    private readonly url: string;

    constructor(url: string) {
      const mapped = {
        'https://chainflap-explor.org/graphql':
          'https://explorer-service-processor.chainflip.io/graphql',
        'https://chainflap-lp.org/graphql': 'https://lp-service.mainnet.chainflip.io/',
      }[url];

      assert(mapped, `Unknown URL: ${url}`);

      this.url = mapped;
    }

    async request(query: RequestDocument, variables: Record<string, any>) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const { default: request } = (await importActual()) as typeof import('graphql-request');
      const sha1 = (str: string) => createHash('sha1').update(str).digest('hex');
      const queryHash = sha1(JSON.stringify(query));
      const variablesHash = sha1(JSON.stringify(variables));

      const fixturesDir = path.join(import.meta.dirname, '__fixtures__');
      const cachedFile = path.join(fixturesDir, queryHash, `${variablesHash}.json`);
      const file = await fs.readFile(cachedFile, 'utf8').catch(() => null);

      if (file) return JSON.parse(file) as unknown;

      const result = await request(this.url, query, variables);

      await fs.mkdir(path.dirname(cachedFile), { recursive: true });
      await fs.writeFile(cachedFile, JSON.stringify(result, null, 2), 'utf8');

      return result;
    }
  }

  return { GraphQLClient };
});
