import { describe, expect, it } from 'vitest';
import { abbreviate, formatUsdValue } from '../strings';

describe('abbreviate', () => {
  it.each([
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['0x4c9b02c3575767a9290ff01d94851fea36def106', '0x4c…f106'],
  ])('displays edited string', (text, expected) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(abbreviate(text)).toBe(expected);
  });

  it.each([
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['0x4c9b02c3575767a9290ff01d94851fea36def106', '0x4…106'],
  ])('displays edited string with show length param', (text, expected) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(abbreviate(text, 3)).toBe(expected);
  });

  it.each([
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['0x4c9b02c3575767a9290ff01d94851fea36def106', '0x. . .06'],
  ])('displays edited string with show length and space params', (text, expected) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(abbreviate(text, 2, true)).toBe(expected);
  });
});

describe('formatUsdValue', () => {
  describe('formatUsdValue', () => {
    it.each([
      ['0', '$0.00'],
      ['0.1', '$0.10'],
      ['0.01', '$0.01'],
      ['0.001', '<$0.01'],
      ['10', '$10.00'],
      [undefined, undefined],
      [null, null],
      ['31.0000000000000', '$31.00'],
      ['10000', '$10,000.00'],
      ['100000', '$100,000.00'],
      ['1000000', '$1,000,000.00'],
      ['10000000', '$10,000,000.00'],
      ['1000000000', '$1,000,000,000.00'],
      ['1000000000.1234', '$1,000,000,000.12'],
      ['1000000000.1239', '$1,000,000,000.12'],
      ['1000000000000.1239', '$1,000,000,000,000.12'],
    ])('precisely formats USD values', (input, expected) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(formatUsdValue(input)).toBe(expected);
    });

    it.each([
      ['0', '$0.00'],
      ['0.1', '$0.10'],
      ['0.01', '$0.01'],
      ['0.001', '<$0.01'],
      ['10', '$10.00'],
      [undefined, undefined],
      [null, null],
      ['31.0000000000000', '$31.00'],
      ['1000', '$1,000.00'],
      ['10000', '$10,000'],
      ['10000.12', '$10,000'],
      ['10000.92', '$10,001'],
      ['100000', '$100,000'],
      ['1000000', '$1M'],
      ['10000000', '$10M'],
      ['1000000000', '$1B'],
      ['1000000000.1234', '$1B'],
      ['1000000000.1239', '$1B'],
      ['1000000000000.1239', '$1T'],
      ['1020000000000.1239', '$1.02T'],
      ['1200000000000.1239', '$1.2T'],
    ])('less precisely formats USD values', (input, expected) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(formatUsdValue(input, false)).toBe(expected);
    });
  });
});
