import { describe, expect, it } from 'vitest';
import { lpClient } from '../../server.js';
import getBoostSummary from '../boostSummary.js';

describe('boost summary', () => {
  it('gets boost summary for all pools', async () => {
    const start = new Date('2024-10-25T00:00:00.000Z');
    const end = new Date('2024-10-25T23:59:59.999Z');
    const asset = 'Btc';

    expect(await getBoostSummary(start, end, asset)).toMatchInlineSnapshot(`
      {
        "apys": [
          {
            "currentApy": "11.37%",
            "feeTiers": 5,
          },
        ],
        "boostedAmount": "17.62890095",
        "boostedAmountUsd": "1189844.1064157963",
        "earnedBoostFee": "0.00880322",
        "earnedBoostFeeUsd": "594.1637309781",
      }
    `);

    expect(lpClient.request).toHaveBeenCalledTimes(1);
  });
});
