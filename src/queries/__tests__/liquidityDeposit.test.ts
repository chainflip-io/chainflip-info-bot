import { describe, expect, it, vi } from 'vitest';
import liquidityDepositStats from './liquidityDeposit.json' with { type: 'json' };
import { explorerClient } from '../../server.js';
import checkForFirstNewLpDeposits from '../liquidityDeposits.js';

describe('checkForFirstNewLpDeposits', () => {
  it('returns the first new deposit per lp', async () => {
    // @ts-expect-error - not typed
    vi.mocked(explorerClient.request).mockImplementation((query, variables) => {
      if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        query.definitions[0].name.value === 'CheckHasOldDeposit'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (variables.liquidityProviderId === 3) {
          return { deposits: { nodes: [{ id: 1, liquidityProviderId: 3 }] } };
        }
        return { deposits: { nodes: [] } };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return liquidityDepositStats;
    });

    const lastCheckedId = 1;
    expect(await checkForFirstNewLpDeposits(lastCheckedId)).toMatchInlineSnapshot(`
      [
        {
          "asset": "Eth",
          "chain": "Ethereum",
          "depositAmount": "1000000000000000000000",
          "id": 9,
          "liquidityProviderId": 1,
        },
        {
          "asset": "Btc",
          "chain": "Bitcoin",
          "depositAmount": "10000000000",
          "id": 12,
          "liquidityProviderId": 2,
        },
      ]
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), { id: lastCheckedId });
  });
});
