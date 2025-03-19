import { describe, expect, it } from 'vitest';
import { type ChainflipAsset } from '../../graphql/generated/explorer/graphql.js';
import { getPriceFromPriceX128 } from '../math.js';

describe('get price from priceX128', () => {
  const prices: [bigint | string, ChainflipAsset, ChainflipAsset, string][] = [
    ['370463044445583550774471879', 'Flip', 'Usdt', '1.088693'],
    [370463044445583550774471879n, 'Flip', 'Usdt', '1.088693'],
    ['0', 'Flip', 'Usdt', '0.000000'],
    ['4889962270189900879391211767659', 'Eth', 'Sol', '14.370307561'],
  ];

  it.each(prices)(
    'displays min price from fok priceX128',
    (priceX128, srcAsset, destAsset, expected) =>
      expect(getPriceFromPriceX128(priceX128, srcAsset, destAsset)).toBe(expected),
  );
});
