import { describe, expect, it, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import getBurns from '../getBurns.js';

describe('getBurns', () => {
  it('get the burns for specific ids', async () => {
    const spy = vi.spyOn(explorerClient, 'request');
    const x = await getBurns([1, 2, 3, 4]);
    expect(x).toMatchInlineSnapshot(`
      {
        "amount": "2510.019857565856816196",
        "valueUsd": "18585.307241412",
      }
    `);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
