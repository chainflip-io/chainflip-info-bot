import { addDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { explorerClient, lpClient } from '../../server.js';
import getSwapVolumeStats from '../swapVolume.js';

describe('swapVolume', () => {
  it('gets the swap volume after a timestamp', async () => {
    const start = new Date('2025-03-19T00:00:00Z');
    const end = addDays(start, 1);
    expect(await getSwapVolumeStats(start, end)).toMatchInlineSnapshot(`
      {
        "boostFees": "3245.2198506501",
        "lpFees": "9670.9169714125",
        "networkFees": "11235.4882822904",
        "swapVolume": "19285901.79858222",
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
