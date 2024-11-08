import { addDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import getSwapVolumeStats from '../swapVolume.js';

describe('swapVolume', () => {
  it('gets the swap volume after a timestamp', async () => {
    const start = new Date('2024-10-25T00:00:00Z');
    const end = addDays(start, 1);
    expect(await getSwapVolumeStats(start, end)).toMatchInlineSnapshot(`
      {
        "boostFees": "594.8701599431",
        "flipBurned": "2343.000793804332426773",
        "lpFees": "2960.8172994353",
        "networkFees": "4359.6587638312",
        "swapVolume": "5910283.6825610709",
      }
    `);
  });
});
