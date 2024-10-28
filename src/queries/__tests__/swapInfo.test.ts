import request from 'graphql-request';
import { describe, it, vi, expect } from 'vitest';
import getSwapInfo from '../getSwapInfo.js';
import swapInfoStats from './swapInfo.json' with { type: 'json' };
import env from '../../env.js';

describe('swapInfo', () => {
  it('gets the swap info by nativeId', async () => {
    vi.mocked(request).mockResolvedValue(swapInfoStats);

    const nativeId = '77697';
    expect(await getSwapInfo(nativeId)).toMatchInlineSnapshot(`
      {
        "alias": "Chainflip Swapping",
        "compeletedEventId": "5116679443",
        "dca": 2,
        "depositAmount": "5000000000000000000000",
        "depositValueUsd": "5568.071581114500000000000000000000",
        "duration": "1 min",
        "egressAmount": "5616094932",
        "egressValueUsd": "5611.379957337800000000000000000000",
        "fok": "370463044445583550774471879",
        "priceDelta": "0.770974623083194771",
        "requestId": "77697",
      }
    `);

    expect(request).toHaveBeenCalledWith(env.EXPLORER_GATEWAY_URL, expect.anything(), {
      nativeId,
    });
  });
});
