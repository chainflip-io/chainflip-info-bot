import { addDays } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import getSwapVolumeStats from '../swapVolume.js';
import lpFeeStats from './lpFeeStats.json' with { type: 'json' };
import swapVolumeStats from './swapVolumeStats.json' with { type: 'json' };
import { explorerClient, lpClient } from '../../server.js';

describe('swapVolume', () => {
  it('gets the swap volume after a timestamp', async () => {
    vi.mocked(explorerClient.request).mockResolvedValueOnce(swapVolumeStats);
    vi.mocked(lpClient.request).mockResolvedValueOnce(lpFeeStats);

    const start = new Date('2024-10-25T00:00:00Z');
    const end = addDays(start, 1);
    expect(await getSwapVolumeStats(start, end)).toMatchInlineSnapshot(`
      {
        "boostFees": "361.8446197502",
        "flipBurned": "2343.000793804332426773",
        "lpFees": "1516.6177040047",
        "networkFees": "1891.3926153737",
        "swapVolume": "3029020.7126806316",
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
