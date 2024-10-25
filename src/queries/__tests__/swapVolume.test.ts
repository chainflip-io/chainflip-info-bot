import { describe, expect, it, vi } from 'vitest';
import request from 'graphql-request';
import getSwapVolumeStats from '../swapVolume.js';
import swapVolumeStats from './swapVolumeStats.json' with { type: 'json' };
import lpFeeStats from './lpFeeStats.json' with { type: 'json' };
import env from '../../env.js';

describe('swapVolume', () => {
  it('gets the swap volume after a timestamp', async () => {
    vi.mocked(request).mockResolvedValueOnce(swapVolumeStats).mockResolvedValueOnce(lpFeeStats);

    const after = '2024-10-25T00:00:00Z';
    expect(await getSwapVolumeStats(after)).toMatchInlineSnapshot(`
      {
        "flipBurned": "2,343.00",
        "lpFees": "$1,516.62",
        "networkFees": "$1,891.39",
        "swapVolume": "$3,029,020.71",
      }
    `);

    expect(request).toHaveBeenCalledWith(env.EXPLORER_GATEWAY_URL, expect.anything(), {
      after: after,
    });
    expect(request).toHaveBeenCalledWith(env.LP_GATEWAY_URL, expect.anything(), { after: after });
  });
});
