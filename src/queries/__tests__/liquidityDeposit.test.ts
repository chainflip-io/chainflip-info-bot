import { describe, expect, it, vi } from 'vitest';
import liquidityDepositStats from './liquidityDeposit.json' with { type: 'json' };
import { client } from '../../server.js';
import checkForFirstNewLpDeposits from '../liquidityDeposits.js';

describe('checkForFirstNewLpDeposits', () => {
  it('returns the first new deposit per lp', async () => {
    vi.mocked(client.request).mockResolvedValueOnce(liquidityDepositStats);
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
        {
          "asset": "Btc",
          "chain": "Bitcoin",
          "depositAmount": "10000000000",
          "id": 14,
          "liquidityProviderId": 3,
        },
      ]
    `);

    expect(client.request).toHaveBeenCalledWith(expect.anything(), { id: lastCheckedId });
  });
});
