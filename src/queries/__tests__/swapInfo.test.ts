import { describe, it, vi, expect } from 'vitest';
import getSwapInfo from '../getSwapInfo.js';
import swapInfoStats from './swapInfo.json' with { type: 'json' };
import { explorerClient } from '../../server.js';

describe('swapInfo', () => {
  it('gets the swap info by nativeId', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue(swapInfoStats);

    const nativeId = '77697';
    expect(await getSwapInfo(nativeId)).toMatchInlineSnapshot(`
      {
        "alias": "Chainflip Swapping",
        "completedEventId": "5116679443",
        "dcaChunks": 2,
        "depositAmount": "5000000000000000000000",
        "depositValueUsd": "5568.071581114500000000000000000000",
        "destinationAsset": "Usdt",
        "duration": "1 min",
        "egressAmount": "5616094932",
        "egressValueUsd": "5611.379957337800000000000000000000",
        "executedAt": "2024-10-25T12:41:06+00:00",
        "minPrice": "1.088693",
        "priceDelta": "0.770974623083194771",
        "requestId": "77697",
        "sourceAsset": "Flip",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), {
      nativeId,
    });
  });
});
