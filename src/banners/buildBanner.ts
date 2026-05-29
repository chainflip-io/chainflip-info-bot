import { type ChainflipAsset } from '@chainflip/utils/chainflip';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { loadAsset } from './assetRegistry.js';
import { fileToDataUrl, renderBanner } from './render.js';
import { SwapBanner, type SwapBannerProps } from './SwapBanner.js';
import { SwapBannerTier1, type SwapBannerTier1Props } from './SwapBannerTier1.js';

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), 'assets');

const TIER_1_THRESHOLD = 500_000;
const TIER_2_THRESHOLD = 1_000_000;

export type SwapBannerData = {
  usdValue: number;
  isBoosted: boolean;
  sourceAsset: ChainflipAsset;
  sourceAmount: number;
  destAsset: ChainflipAsset;
  destAmount: number;
  durationMinutes?: number;
  originalDurationMinutes?: number;
  aggregator?: string;
  marketPriceDeltaPct: number;
};

const dataUrlCache = new Map<string, Promise<string>>();
const cachedDataUrl = (path: string) => {
  let cached = dataUrlCache.get(path);
  if (!cached) {
    cached = fileToDataUrl(path);
    dataUrlCache.set(path, cached);
  }
  return cached;
};

const tierFor = (usdValue: number) =>
  usdValue >= TIER_2_THRESHOLD ? 3 : usdValue >= TIER_1_THRESHOLD ? 2 : 1;

export const buildBanner = async (data: SwapBannerData): Promise<Buffer> => {
  const tier = tierFor(data.usdValue);
  const variant = data.isBoosted ? 'boosted' : 'regular';

  const [source, dest, swapIconUrl, boltIconUrl, backgroundUrl] = await Promise.all([
    loadAsset(data.sourceAsset),
    loadAsset(data.destAsset),
    cachedDataUrl(join(assetsDir, 'swap-icon.png')),
    cachedDataUrl(join(assetsDir, 'tokens/bolt.png')),
    cachedDataUrl(join(assetsDir, `backgrounds/tier${tier}-${variant}.png`)),
  ]);

  if (tier === 1) {
    const props: SwapBannerTier1Props = {
      usdValue: data.usdValue,
      isBoosted: data.isBoosted,
      sourceAsset: {
        iconUrl: source.iconUrl,
        symbol: source.symbol,
        amount: data.sourceAmount,
        chainBadgeUrl: source.chainBadgeUrl,
      },
      destAsset: {
        iconUrl: dest.iconUrl,
        symbol: dest.symbol,
        amount: data.destAmount,
        chainBadgeUrl: dest.chainBadgeUrl,
      },
      durationMinutes: data.durationMinutes,
      originalDurationMinutes: data.originalDurationMinutes,
      aggregator: data.aggregator,
      marketPriceDeltaPct: data.marketPriceDeltaPct,
      backgroundUrl,
      boltIconUrl,
      smallSourceIconUrl: source.smallIconUrl,
      smallDestIconUrl: dest.smallIconUrl,
      swapIconUrl,
    };
    return renderBanner(createElement(SwapBannerTier1, props));
  }

  const props: SwapBannerProps = {
    usdValue: data.usdValue,
    isBoosted: data.isBoosted,
    sourceAsset: {
      iconUrl: source.smallIconUrl,
      symbol: source.symbol,
      amount: data.sourceAmount,
      chainBadgeUrl: source.chainBadgeUrl,
    },
    destAsset: {
      iconUrl: dest.smallIconUrl,
      symbol: dest.symbol,
      amount: data.destAmount,
      chainBadgeUrl: dest.chainBadgeUrl,
    },
    durationMinutes: data.durationMinutes,
    originalDurationMinutes: data.originalDurationMinutes,
    aggregator: data.aggregator,
    marketPriceDeltaPct: data.marketPriceDeltaPct,
    backgroundUrl,
    swapIconUrl,
    boltIconUrl,
  };
  return renderBanner(createElement(SwapBanner, props));
};
