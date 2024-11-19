import { describe, it, expect } from 'vitest';
import { explorerClient } from '../../server.js';
import getSwapInfo from '../getSwapInfo.js';

describe('swapInfo', () => {
  it('gets the swap info by nativeId', async () => {
    const nativeId = '77697';
    expect(await getSwapInfo(nativeId)).toMatchInlineSnapshot(`
      {
        "affiliatesIdsAndAliases": [],
        "boostFee": "0",
        "brokerIdAndAlias": {
          "alias": "Chainflip Swapping",
          "brokerId": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
        },
        "chunkIntervalBlocks": 2,
        "completedAt": "2024-10-25T12:41:30+00:00",
        "completedEventId": "5116679443",
        "dcaChunks": "2/2",
        "depositAmount": "5000",
        "depositValueUsd": "5568.0715811145",
        "destinationAsset": "Usdt",
        "duration": "1 min",
        "egressAmount": "5616.094932",
        "egressValueUsd": "5611.3799573378",
        "minPrice": "1.088693",
        "originalDepositAmount": "5000",
        "originalDepositValueUsd": "5568.071581114500000000000000000000",
        "priceDelta": 43.3083762233,
        "priceDeltaPercentage": "0.78",
        "refundAmount": null,
        "refundValueUsd": null,
        "requestId": "77697",
        "sourceAsset": "Flip",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), {
      nativeId,
    });
  });

  it('gets boosted swap info by nativeId', async () => {
    const nativeId = '98822';

    expect(await getSwapInfo(nativeId)).toMatchInlineSnapshot(`
      {
        "affiliatesIdsAndAliases": [],
        "boostFee": "0.2167859022",
        "brokerIdAndAlias": {
          "alias": "Chainflip Swapping",
          "brokerId": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
        },
        "chunkIntervalBlocks": 2,
        "completedAt": "2024-11-05T11:35:54+00:00",
        "completedEventId": "5377221676",
        "dcaChunks": undefined,
        "depositAmount": "0.0063",
        "depositValueUsd": "433.5718044229",
        "destinationAsset": "Eth",
        "duration": "9 min",
        "egressAmount": "0.177273354596517176",
        "egressValueUsd": "432.3117387496",
        "minPrice": "28.027233685216537779",
        "originalDepositAmount": "0.0063",
        "originalDepositValueUsd": "433.571804422900000000000000000000",
        "priceDelta": -1.260065673300005,
        "priceDeltaPercentage": "-0.29",
        "refundAmount": null,
        "refundValueUsd": null,
        "requestId": "98822",
        "sourceAsset": "Btc",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), {
      nativeId,
    });
  });

  it('gets info about a fully refunded swap', async () => {
    const nativeId = '103706';
    expect(await getSwapInfo(nativeId)).toMatchInlineSnapshot(`
      {
        "affiliatesIdsAndAliases": [],
        "boostFee": "0",
        "brokerIdAndAlias": {
          "alias": "Chainflip Swapping",
          "brokerId": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
        },
        "chunkIntervalBlocks": 2,
        "completedAt": "2024-11-08T13:08:42+00:00",
        "completedEventId": "5459228833",
        "dcaChunks": undefined,
        "depositAmount": "0.00248514961846",
        "depositValueUsd": "7.2932954394089153441156",
        "destinationAsset": "Btc",
        "duration": undefined,
        "egressAmount": null,
        "egressValueUsd": null,
        "minPrice": "0.03891783",
        "originalDepositAmount": "0.01",
        "originalDepositValueUsd": "29.347510448600000000000000000000",
        "priceDelta": null,
        "priceDeltaPercentage": null,
        "refundAmount": "0.00751485038154",
        "refundValueUsd": "22.0970806038",
        "requestId": "103706",
        "sourceAsset": "Eth",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), {
      nativeId,
    });
  });
});
