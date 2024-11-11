import { describe, expect, it } from 'vitest';
import { explorerClient } from '../../server.js';
import getBurns from '../getBurns.js';

describe('getBurns', () => {
  it('get the burns for specific ids', async () => {
    const x = await getBurns([1, 2, 3, 4]);
    expect(x).toMatchInlineSnapshot(`
      {
        "amount": "2510.019857565856816196",
        "valueUsd": "18585.307241412",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledTimes(1);
  });
});
