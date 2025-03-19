import { addDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { explorerClient, lpClient } from '../../server.js';
import getSwapVolumeStats from '../swapVolume.js';

describe('swapVolume', () => {
  it('gets the swap volume after a timestamp', async () => {
    const start = new Date('2025-03-18T18:00:00Z');
    const end = addDays(start, 1);
    expect(await getSwapVolumeStats(start, end)).toMatchInlineSnapshot(`
      {
        "boostFees": "3354.5259394817",
        "lpFees": "10877.0406224969",
        "networkFees": "12397.3666743582",
        "swapVolume": "21694837.7712332279",
        "totalFlipBurned": "12397.586388460529611576",
      }
    `);

    const args = {
      start: start.toISOString(),
      end: end.toISOString(),
    };
    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), args);
    expect(lpClient.request).toHaveBeenCalledWith(expect.anything(), args);
  });
});
