import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { toBigNumberOrNull, toFormattedAmount } from '../chainflip.js';

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

describe('toBigNumberOrNull', () => {
  it('parses a valid numeric string', () => {
    const result = toBigNumberOrNull('1234.5678');
    expect(result).toBeInstanceOf(BigNumber);
    expect(result?.toString()).toBe('1234.5678');
  });

  it('parses a number', () => {
    expect(toBigNumberOrNull(42)?.toString()).toBe('42');
  });

  it.each([null, undefined])('returns null for %s', (value) => {
    expect(toBigNumberOrNull(value)).toBeNull();
  });

  it.each(['garbage', '', 'NaN', '1.2.3', Infinity, NaN])(
    'returns null for malformed/non-finite input (%s)',
    (value) => {
      expect(toBigNumberOrNull(value)).toBeNull();
    },
  );
});
