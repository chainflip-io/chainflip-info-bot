import { describe, expect, it, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import getBurns from '../burns.js';

describe('getBurns', () => {
  it('get the burns for specific ids', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue({
      allBurns: {
        aggregates: {
          sum: {
            amount: '1467127719344700526679',
            valueUsd: '4428.14',
          },
        },
      },
    });

    const x = await getBurns([1, 2, 3, 4]);
    expect(x).toMatchInlineSnapshot(`
      {
        "amount": "1467.127719344700526679",
        "valueUsd": "4428.14",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledTimes(1);
  });
});
