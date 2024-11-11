import { type ChainflipAsset } from '@chainflip/utils/chainflip';
import { describe, expect, it } from 'vitest';
import { toFormattedAmount } from '../chainflip.js';

describe('gets the correct token amount from base units', () => {
  it.each([
    ['Eth' as ChainflipAsset, '1000000000000000000', '1'],
    ['Eth' as ChainflipAsset, '1100000000000000000', '1.1'],
    ['Eth' as ChainflipAsset, '1100000900000000000', '1.100001'],
    ['Usdc' as ChainflipAsset, '1000000', '1'],
    ['Usdc' as ChainflipAsset, '1', '0.000001'],
    ['Usdc' as ChainflipAsset, '100000000000', '100,000'],
    ['Usdt' as ChainflipAsset, '1000000', '1'],
    ['Sol' as ChainflipAsset, '1000000000', '1'],
    ['SolUsdc' as ChainflipAsset, '1000000', '1'],
    ['ArbUsdc' as ChainflipAsset, '1000000', '1'],
    ['Btc' as ChainflipAsset, '100000000', '1'],
    ['Dot' as ChainflipAsset, '10000000000', '1'],
  ])('converts base units to token amount ([%s] %s => %s)', (asset, amount, expected) =>
    expect(toFormattedAmount(amount, asset)).toBe(expected),
  );
});
