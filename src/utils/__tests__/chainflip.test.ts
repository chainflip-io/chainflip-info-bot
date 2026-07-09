import { describe, expect, it } from 'vitest';
import { toFormattedAmount } from '../chainflip.js';

describe('gets the correct token amount from base units', () => {
  it.each([
    ['Eth', '1000000000000000000', '1'],
    ['Eth', '1100000000000000000', '1.1'],
    ['Eth', '1100000900000000000', '1.100001'],
    ['Usdc', '1000000', '1'],
    ['Usdc', '1', '0.000001'],
    ['Usdc', '100000000000', '100,000'],
    ['Usdt', '1000000', '1'],
    ['Sol', '1000000000', '1'],
    ['SolUsdc', '1000000', '1'],
    ['ArbUsdc', '1000000', '1'],
    ['Btc', '100000000', '1'],
    ['Dot', '10000000000', '1'],
  ])('converts base units to token amount ([%s] %s => %s)', (asset, amount, expected) =>
    expect(toFormattedAmount(amount, asset)).toBe(expected),
  );
});
