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

      return liquidityDepositStats;
    });

    const lastCheckedId = 1;
    expect(await checkForFirstNewLpDeposits(lastCheckedId)).toMatchInlineSnapshot(`
      [
        {
          "asset": "Eth",
          "depositAmount": "1.2",
          "depositValueUsd": undefined,
          "lpIdSs58": "cf111111test",
          "timestamp": "2021-08-10T00:00:00Z",
        },
        {
          "asset": "Btc",
          "depositAmount": "1",
          "depositValueUsd": undefined,
          "lpIdSs58": "cf222222test",
          "timestamp": "2021-08-10T00:00:00Z",
        },
      ]
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), { id: lastCheckedId });
  });
});
