import { describe, expect, it, vi } from 'vitest';
import request from 'graphql-request';
import getSwapVolumeStats from '../swapVolume.js';
import swapVolumeStats from './swapVolumeStats.json' with { type: 'json' };

describe('swapVolume', () => {
  it('gets the swap volume after a timestamp', async () => {
    vi.mocked(request).mockResolvedValue(swapVolumeStats);

    expect(await getSwapVolumeStats('2024-10-25T00:00:00Z')).toMatchInlineSnapshot(`
      {
        "networkFees": "1,330.21",
        "swapVolume": "1,913,718.36",
      }
    `);

    console.log(vi.mocked(request).mock.calls);
  });
});
