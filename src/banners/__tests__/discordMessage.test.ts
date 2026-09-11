import { describe, expect, it } from 'vitest';
import { formatAmount, formatUsdCopy, withThousands } from '../discordMessage.js';

describe('withThousands', () => {
  it('adds thousands separators to integers', () => {
    expect(withThousands(6180, 0)).toBe('6,180');
    expect(withThousands(1_234_567, 0)).toBe('1,234,567');
  });

  it('keeps up to maxDecimals decimals and rounds', () => {
    expect(withThousands(1234.56, 1)).toBe('1,234.6');
    expect(withThousands(1234.5, 2)).toBe('1,234.5');
  });

  it('never pads with trailing zeros', () => {
    expect(withThousands(41.6, 2)).toBe('41.6');
    expect(withThousands(42, 2)).toBe('42');
  });
});

describe('formatAmount', () => {
  describe('non-stablecoins', () => {
    it('adds thousands separators for amounts >= 1000', () => {
      // Previously "1500000 TRX"; now grouped.
      expect(formatAmount('Trx', 1_500_000)).toBe('1,500,000 TRX');
      expect(formatAmount('Sol', 6180)).toBe('6,180 SOL');
    });

    it('uses 1 decimal for amounts >= 100', () => {
      expect(formatAmount('Eth', 1234.56)).toBe('1,234.6 ETH');
    });

    it('uses 2 decimals for amounts < 100', () => {
      expect(formatAmount('Btc', 2)).toBe('2 BTC');
      expect(formatAmount('Btc', 0.905)).toBe('0.91 BTC');
    });
  });

  describe('stablecoins', () => {
    it('abbreviates millions and thousands (unchanged)', () => {
      expect(formatAmount('Usdt', 4_284_450)).toBe('4.28M USDT (ETH)');
      expect(formatAmount('SolUsdc', 156_130)).toBe('156.13K USDC (SOL)');
    });

    it('groups amounts under 1000', () => {
      expect(formatAmount('Usdt', 500)).toBe('500 USDT (ETH)');
    });
  });
});

describe('formatUsdCopy', () => {
  it('abbreviates millions with up to 2 decimals', () => {
    expect(formatUsdCopy(4_284_450)).toBe('$4.28M');
    expect(formatUsdCopy(1_000_000)).toBe('$1M');
  });

  it('abbreviates thousands, rounded to whole K', () => {
    expect(formatUsdCopy(156_130)).toBe('$156K');
    expect(formatUsdCopy(999_400)).toBe('$999K');
  });
});
