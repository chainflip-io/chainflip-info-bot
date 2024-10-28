import { describe, expect, it } from 'vitest';
import { formatUsdValue } from '../utils';

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
