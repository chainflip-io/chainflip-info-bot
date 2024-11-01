import { describe, expect, it } from 'vitest';
import { ChainflipAsset } from '../../graphql/generated/graphql';
import { toTokenAmount } from '../chainflip';

describe('gets the correct token amount from base units', () => {
  it.each([
    ['Eth' as ChainflipAsset, '1000000000000000000', '1'],
    ['Usdc' as ChainflipAsset, '1000000', '1'],
    ['Usdt' as ChainflipAsset, '1000000', '1'],
    ['Sol' as ChainflipAsset, '1000000000', '1'],
    ['SolUsdc' as ChainflipAsset, '1000000', '1'],
    ['ArbUsdc' as ChainflipAsset, '1000000', '1'],
    ['Btc' as ChainflipAsset, '100000000', '1'],
    ['Dot' as ChainflipAsset, '10000000000', '1'],
  ])('converts base units to token amount', (asset, amount, expected) =>
    expect(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      toTokenAmount(amount, asset),
    ).toBe(expected),
  );
});
