import { describe, it, vi, expect } from 'vitest';
import getSwapInfo from '../getSwapInfo.js';
import swapInfoStats from './swapInfo.json' with { type: 'json' };
import swapInfoWithBoostStats from './swapInfoWithBoost.json' with { type: 'json' };
import { explorerClient } from '../../server.js';

describe('swapInfo', () => {
  it('gets the swap info by nativeId', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue(swapInfoStats);

    const nativeId = '77697';
    expect(await getSwapInfo(nativeId)).toMatchInlineSnapshot(`
      {
        "boostFee": undefined,
        "brokerIdAndAlias": {
          "alias": "Chainflip Swapping",
          "brokerId": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
        },
        "completedAt": "2024-10-25T12:41:30+00:00",
        "completedEventId": "5116679443",
        "dcaChunks": "2/2",
        "depositAmount": "5000",
        "depositValueUsd": "5568.071581114500000000000000000000",
        "destinationAsset": "Usdt",
        "duration": "1 min",
        "effectiveBoostFeeBps": null,
        "egressAmount": "5616.094932",
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

  it('gets boosted swap info by nativeId', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue(swapInfoWithBoostStats);

    const nativeId = '98822';

    expect(await getSwapInfo(nativeId)).toMatchInlineSnapshot(`
      {
        "boostFee": {
          "valueUsd": 0.2167859022,
        },
        "brokerIdAndAlias": {
          "alias": "Chainflip Swapping",
          "brokerId": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
        },
        "completedAt": "2024-11-05T11:35:54+00:00",
        "completedEventId": "5377221676",
        "dcaChunks": undefined,
        "depositAmount": "0.0063",
        "depositValueUsd": "433.571804422900000000000000000000",
        "destinationAsset": "Eth",
        "duration": "9 min",
        "effectiveBoostFeeBps": 5,
        "egressAmount": "0.177273354596517176",
        "egressValueUsd": "432.311738749600000000000000000000",
        "minPrice": "28.027233685216537779",
        "priceDelta": -1.260065673300005,
        "priceDeltaPercentage": "-0.36",
        "requestId": "98822",
        "sourceAsset": "Btc",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), {
      nativeId,
    });
  });
});
