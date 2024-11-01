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
          "depositAmount": "1.2",
          "id": 9,
          "lp": {
            "account": {
              "idSs58": "cf111111test",
            },
            "id": 1,
          },
          "lpIdSs58": "cf111111test",
        },
        {
          "asset": "Btc",
          "chain": "Bitcoin",
          "depositAmount": "1",
          "id": 12,
          "lp": {
            "account": {
              "idSs58": "cf222222test",
            },
            "id": 2,
          },
          "lpIdSs58": "cf222222test",
        },
      ]
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), { id: lastCheckedId });
  });
});
