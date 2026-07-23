import { createElement } from 'react';
import { type ChainflipAsset } from '@chainflip/utils/chainflip';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAsset, loadDataUrl } from './assetRegistry.js';
import { renderBanner } from './render.js';
import { SwapBanner, type SwapBannerProps } from './SwapBanner.js';
import { SwapBannerTier1, type SwapBannerTier1Props } from './SwapBannerTier1.js';

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), '../assets');

export const TIER_1_THRESHOLD = 495_000;
export const TIER_2_THRESHOLD = 995_000;
export const TIER_3_THRESHOLD = 1_980_000;

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
  oraclePriceDeltaPct: number;
  isRecord?: boolean;
};

const tierFor = (usdValue: number) =>
  usdValue >= TIER_3_THRESHOLD
    ? 4
    : usdValue >= TIER_2_THRESHOLD
      ? 3
      : usdValue >= TIER_1_THRESHOLD
        ? 2
        : 1;

export const buildBanner = async (data: SwapBannerData): Promise<Buffer> => {
  const tier = tierFor(data.usdValue);
  const variant = data.isBoosted ? 'boosted' : 'regular';
  const backgroundFile = data.isRecord ? 'record' : tier === 4 ? 'tier4' : `tier${tier}-${variant}`;

  const [source, dest, swapIconUrl, boltIconUrl, backgroundUrl] = await Promise.all([
    loadAsset(data.sourceAsset),
    loadAsset(data.destAsset),
    loadDataUrl(join(assetsDir, 'swap-icon.png')),
    loadDataUrl(join(assetsDir, 'tokens/bolt.png')),
    loadDataUrl(join(assetsDir, `backgrounds/${backgroundFile}.png`)),
  ]);

  if (tier === 1 && !data.isRecord) {
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
      oraclePriceDeltaPct: data.oraclePriceDeltaPct,
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
    oraclePriceDeltaPct: data.oraclePriceDeltaPct,
    backgroundUrl,
    swapIconUrl,
    boltIconUrl,
  };
  return renderBanner(createElement(SwapBanner, props));
};
