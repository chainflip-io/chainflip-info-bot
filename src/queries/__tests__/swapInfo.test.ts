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
        "depositAddress": "0xf05914614bc56915ce5dac12d8eabdbd4bf1e470",
        "depositAmount": "5000",
        "depositValueUsd": "5568.0715811145",
        "destinationAddress": "0x4c632678b9a2c2f0ca1472d17c683aab6dc16523",
        "destinationAsset": "Usdt",
        "duration": "1 min",
        "egressAmount": "5616.094932",
        "egressValueUsd": "5611.3799573378",
        "freshness": "stale",
        "lpIdAndAlias": undefined,
        "minPrice": "1.088693",
        "priceDelta": "43.3083762233",
        "priceDeltaPercentage": "0.78",
        "refundAmount": null,
        "refundValueUsd": null,
        "requestId": "77697",
        "sourceAsset": "Flip",
        "transactionRefs": [
          {
            "chain": "Ethereum",
            "ref": "0x17077234a0e19f7b4ab2d2491c09065d8a164199ffbbd9fd02078f8394eb36e4",
          },
        ],
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
        "depositAddress": "bc1pmwr06j590e2at339n5tx9th2f457sdagl4q88vkeyjhrdwa9jfasyc5ftn",
        "depositAmount": "0.0063",
        "depositValueUsd": "433.5718044229",
        "destinationAddress": "0xc36fa10986e21eed094a674ec4e3b75ef4ba4f05",
        "destinationAsset": "Eth",
        "duration": "9 min",
        "egressAmount": "0.177273354596517176",
        "egressValueUsd": "432.3117387496",
        "freshness": "stale",
        "lpIdAndAlias": undefined,
        "minPrice": "28.027233685216537779",
        "priceDelta": "-1.2600656733",
        "priceDeltaPercentage": "-0.29",
        "refundAmount": null,
        "refundValueUsd": null,
        "requestId": "98822",
        "sourceAsset": "Btc",
        "transactionRefs": [
          {
            "chain": "Bitcoin",
            "ref": "166532943ebf0f00a6419329b2d81d07d8a83eec370d727464950ef4d6191c99",
          },
        ],
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
        "depositAddress": "0x8ac994118800f910549b5d222a4caade7200f093",
        "depositAmount": "0.01",
        "depositValueUsd": "29.3475104486",
        "destinationAddress": "bc1pz8tyhfz88j8s7qt6epuewjg5cyy5l4ddawwe6yvxk7q9jvhu2wqsavdkl9",
        "destinationAsset": "Btc",
        "duration": undefined,
        "egressAmount": null,
        "egressValueUsd": null,
        "freshness": "stale",
        "lpIdAndAlias": undefined,
        "minPrice": "0.03891783",
        "priceDelta": null,
        "priceDeltaPercentage": null,
        "refundAmount": "0.00751485038154",
        "refundValueUsd": "22.0970806038",
        "requestId": "103706",
        "sourceAsset": "Eth",
        "transactionRefs": [
          {
            "chain": "Ethereum",
            "ref": "0xb689f685c527573b19141a33a4914dc0d72c13ab525540d76536e79fb0814fb3",
          },
        ],
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledWith(expect.anything(), {
      nativeId,
    });
  });
});
