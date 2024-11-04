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
        "brokerIdAndAlias": {
          "alias": "Chainflip Swapping",
          "brokerId": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
        },
        "completedAt": "2024-10-25T12:41:30+00:00",
        "completedEventId": "5116679443",
        "dcaChunks": 2,
        "depositAmountFormatted": "5000",
        "depositValueUsd": "5568.071581114500000000000000000000",
        "destinationAsset": "Usdt",
        "duration": "1 min",
        "egressAmountFormatted": "5616.094932",
        "egressValueUsd": "5611.379957337800000000000000000000",
        "minPrice": "1.088693",
        "priceDelta": 43.3083762233,
        "priceDeltaPercentage": "0.77",
        "requestId": "77697",
        "sourceAsset": "Flip",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), {
      nativeId,
    });
  });
});
