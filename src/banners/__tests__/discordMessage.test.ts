import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatDiscordMessage,
  formatUsdCopy,
  withThousands,
  type DiscordMessageInput,
} from '../discordMessage.js';

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

const baseInput: DiscordMessageInput = {
  usdValue: 156_130,
  sourceAsset: 'Btc',
  sourceAmount: 2,
  destAsset: 'Usdc',
  destAmount: 156_130,
  swapId: '1802419',
  durationMinutes: 6,
  isBoosted: true,
  originalDurationMinutes: 26,
};

describe('formatDiscordMessage — aggregator handle resolution', () => {
  it('tags HoudiniSwap even when the alias carries an emoji (affiliate)', () => {
    const message = formatDiscordMessage({ ...baseInput, affiliateAlias: 'HoudiniSwap 🧙‍♂️' });
    expect(message).toContain('via @HoudiniSwap');
    expect(message).not.toContain('🧙');
  });

  it('tags HoudiniSwap when it is the broker alias', () => {
    const message = formatDiscordMessage({ ...baseInput, brokerAlias: 'HoudiniSwap 🧙‍♂️' });
    expect(message).toContain('via @HoudiniSwap');
    expect(message).not.toContain('🧙');
  });

  it('tags @Trezor as affiliate or broker', () => {
    expect(formatDiscordMessage({ ...baseInput, affiliateAlias: 'Trezor' })).toContain(
      'via @Trezor',
    );
    expect(formatDiscordMessage({ ...baseInput, brokerAlias: 'Trezor' })).toContain('via @Trezor');
  });

  it('falls back to the cleaned name for an unknown alias', () => {
    const message = formatDiscordMessage({ ...baseInput, affiliateAlias: 'SomeNewDex 🚀' });
    expect(message).toContain('via SomeNewDex');
    expect(message).not.toContain('🚀');
  });
});

describe('formatDiscordMessage — X-only copy', () => {
  const bnbInput: DiscordMessageInput = {
    usdValue: 182_400,
    sourceAsset: 'Bnb',
    sourceAmount: 285.4,
    destAsset: 'Btc',
    destAmount: 1.92,
    swapId: '1',
    durationMinutes: 3,
    isBoosted: false,
    oraclePriceDeltaPct: -0.04,
  };

  it('leaves price vs market to the banner on X', () => {
    expect(formatDiscordMessage({ ...bnbInput, platform: 'twitter' })).not.toContain('vs market');
    expect(
      formatDiscordMessage({ ...bnbInput, oraclePriceDeltaPct: 0.08, platform: 'twitter' }),
    ).not.toContain('vs market');
    expect(
      formatDiscordMessage({ ...bnbInput, usdValue: 1_310_000, platform: 'twitter' }),
    ).not.toContain('vs market');
  });

  it('leads tier 2+ headlines with a verb on X', () => {
    const big = { ...bnbInput, usdValue: 1_310_000, sourceAsset: 'Eth' as const };
    expect(formatDiscordMessage({ ...big, platform: 'twitter' })).toMatch(
      /^\$1\.31M swapped cross-chain in 3 minutes\./,
    );
    expect(formatDiscordMessage(big)).toMatch(/^\$1\.31M cross-chain in 3 minutes\./);
  });

  it('leaves Discord copy unchanged', () => {
    const discord = formatDiscordMessage(bnbInput);
    expect(discord).toContain('-0.04% vs market');
  });

  it('formats small swaps: USD headline, cashtag on the bought asset', () => {
    expect(
      formatDiscordMessage({
        ...bnbInput,
        oraclePriceDeltaPct: 0.08,
        affiliateAlias: 'Trezor',
        platform: 'twitter',
      }),
    ).toMatchInlineSnapshot(`
      "$182K BNB → BTC in 3 minutes via @Trezor.

      https://scan.chainflip.io/swaps/1"
    `);
  });

  it('formats boosted swaps with the unboosted time', () => {
    expect(
      formatDiscordMessage({
        usdValue: 241_000,
        sourceAsset: 'Btc',
        sourceAmount: 2.54,
        destAsset: 'BscUsdt',
        destAmount: 241_000,
        swapId: '2',
        durationMinutes: 4,
        originalDurationMinutes: 24,
        isBoosted: true,
        oraclePriceDeltaPct: 0.03,
        affiliateAlias: 'Trust Wallet',
        platform: 'twitter',
      }),
    ).toMatchInlineSnapshot(`
      "$241K BTC → USDT in 4 minutes via @TrustWallet, with Boost (normally ~24 min).

      https://scan.chainflip.io/swaps/2"
    `);
  });

  it('formats big swaps with integrator and broker', () => {
    expect(
      formatDiscordMessage({
        usdValue: 2_420_000,
        sourceAsset: 'BscUsdt',
        sourceAmount: 2_420_000,
        destAsset: 'Cbbtc',
        destAmount: 25.5,
        swapId: '3',
        durationMinutes: 6,
        isBoosted: false,
        oraclePriceDeltaPct: 0.05,
        affiliateAlias: 'Trezor',
        brokerAlias: 'SwapKit',
        platform: 'twitter',
      }),
    ).toMatchInlineSnapshot(`
      "$2.42M swapped cross-chain in 6 minutes via @Trezor, routed through @SwapKitPowered.

      https://scan.chainflip.io/swaps/3"
    `);
  });

  it('tags the integrator on record posts', () => {
    expect(
      formatDiscordMessage({
        usdValue: 5_100_000,
        sourceAsset: 'Btc',
        sourceAmount: 53.7,
        destAsset: 'Eth',
        destAmount: 1_640,
        swapId: '4',
        durationMinutes: 9,
        isBoosted: false,
        oraclePriceDeltaPct: 0.01,
        isRecord: true,
        affiliateAlias: 'Trezor',
        platform: 'twitter',
      }),
    ).toMatchInlineSnapshot(`
      "New record: $5.1M swapped cross-chain on @Trezor via Chainflip.

      53.7 BTC → 1,640 ETH in 9 minutes, +0.01% vs market.

      https://scan.chainflip.io/swaps/4"
    `);
  });
});
