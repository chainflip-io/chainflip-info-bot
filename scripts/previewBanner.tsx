#!/usr/bin/env tsx
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createElement, type ReactElement } from 'react';
import { fileURLToPath } from 'node:url';
import { fileToDataUrl, renderBanner } from '../src/banners/render.js';
import { SwapBanner, type SwapBannerProps } from '../src/banners/SwapBanner.js';
import { SwapBannerTier1, type SwapBannerTier1Props } from '../src/banners/SwapBannerTier1.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const [
  tier1Regular,
  tier1Boosted,
  tier2Regular,
  tier2Boosted,
  tier3Regular,
  tier3Boosted,
  btcSmall,
  ethSmall,
  usdtSmall,
  btcLarge,
  ethLarge,
  swapIcon,
  ethChain,
  arbChain,
  boltIcon,
] = await Promise.all([
  fileToDataUrl(join(root, 'src/banners/assets/backgrounds/tier1-regular.png')),
  fileToDataUrl(join(root, 'src/banners/assets/backgrounds/tier1-boosted.png')),
  fileToDataUrl(join(root, 'src/banners/assets/backgrounds/tier2-regular.png')),
  fileToDataUrl(join(root, 'src/banners/assets/backgrounds/tier2-boosted.png')),
  fileToDataUrl(join(root, 'src/banners/assets/backgrounds/tier3-regular.png')),
  fileToDataUrl(join(root, 'src/banners/assets/backgrounds/tier3-boosted.png')),
  fileToDataUrl(join(root, 'src/banners/assets/tokens/btc-small.png')),
  fileToDataUrl(join(root, 'src/banners/assets/tokens/eth-small.png')),
  fileToDataUrl(join(root, 'src/banners/assets/tokens/usdt-small.png')),
  fileToDataUrl(join(root, 'src/banners/assets/tokens/btc.png')),
  fileToDataUrl(join(root, 'src/banners/assets/tokens/eth.png')),
  fileToDataUrl(join(root, 'src/banners/assets/swap-icon.png')),
  fileToDataUrl(join(root, 'src/banners/assets/chains/eth.png')),
  fileToDataUrl(join(root, 'src/banners/assets/chains/arb.png')),
  fileToDataUrl(join(root, 'src/banners/assets/tokens/bolt.png')),
]);

type Variant = { name: string; element: ReactElement };

const tier23Variants: { name: string; props: SwapBannerProps }[] = [
  {
    name: 'tier2-regular',
    props: {
      usdValue: 502_000,
      sourceAsset: { iconUrl: usdtSmall, symbol: 'USDC', amount: 502_000, chainBadgeUrl: ethChain },
      destAsset: { iconUrl: btcSmall, symbol: 'BTC', amount: 20 },
      aggregator: 'Rango',
      oraclePriceDeltaPct: -0.07,
      isBoosted: false,
      durationMinutes: 5,
      backgroundUrl: tier2Regular,
      swapIconUrl: swapIcon,
      boltIconUrl: boltIcon,
    },
  },
  {
    name: 'tier2-boosted',
    props: {
      usdValue: 502_000,
      sourceAsset: { iconUrl: btcSmall, symbol: 'BTC', amount: 20 },
      destAsset: { iconUrl: usdtSmall, symbol: 'USDC', amount: 502_000, chainBadgeUrl: ethChain },
      aggregator: 'Rango',
      oraclePriceDeltaPct: -0.07,
      isBoosted: true,
      durationMinutes: 8,
      originalDurationMinutes: 52,
      backgroundUrl: tier2Boosted,
      swapIconUrl: swapIcon,
      boltIconUrl: boltIcon,
    },
  },
  {
    name: 'tier3-regular',
    props: {
      usdValue: 1_200_000,
      sourceAsset: {
        iconUrl: usdtSmall,
        symbol: 'USDT',
        amount: 1_200_000,
        chainBadgeUrl: ethChain,
      },
      destAsset: { iconUrl: btcSmall, symbol: 'BTC', amount: 19 },
      aggregator: 'SwapKit',
      oraclePriceDeltaPct: -0.07,
      isBoosted: false,
      durationMinutes: 18,
      backgroundUrl: tier3Regular,
      swapIconUrl: swapIcon,
      boltIconUrl: boltIcon,
    },
  },
  {
    name: 'tier3-boosted',
    props: {
      usdValue: 1_200_000,
      sourceAsset: {
        iconUrl: usdtSmall,
        symbol: 'USDT',
        amount: 1_200_000,
        chainBadgeUrl: ethChain,
      },
      destAsset: { iconUrl: btcSmall, symbol: 'BTC', amount: 19 },
      aggregator: 'SwapKit',
      oraclePriceDeltaPct: -0.07,
      isBoosted: true,
      durationMinutes: 5,
      originalDurationMinutes: 52,
      backgroundUrl: tier3Boosted,
      swapIconUrl: swapIcon,
      boltIconUrl: boltIcon,
    },
  },
];

const tier1Variants: { name: string; props: SwapBannerTier1Props }[] = [
  {
    name: 'tier1-regular',
    props: {
      usdValue: 400_000,
      sourceAsset: { iconUrl: ethLarge, symbol: 'ETH', amount: 57.8, chainBadgeUrl: arbChain },
      destAsset: { iconUrl: btcLarge, symbol: 'BTC', amount: 0.9 },
      aggregator: 'Rango',
      oraclePriceDeltaPct: -0.07,
      isBoosted: false,
      durationMinutes: 25,
      backgroundUrl: tier1Regular,
      smallSourceIconUrl: ethSmall,
      smallDestIconUrl: btcSmall,
      swapIconUrl: swapIcon,
      boltIconUrl: boltIcon,
    },
  },
  {
    name: 'tier1-boosted',
    props: {
      usdValue: 400_000,
      sourceAsset: { iconUrl: btcLarge, symbol: 'BTC', amount: 0.9 },
      destAsset: { iconUrl: ethLarge, symbol: 'ETH', amount: 57.8, chainBadgeUrl: arbChain },
      aggregator: 'Rango',
      oraclePriceDeltaPct: -0.07,
      isBoosted: true,
      durationMinutes: 8,
      originalDurationMinutes: 52,
      backgroundUrl: tier1Boosted,
      smallSourceIconUrl: btcSmall,
      smallDestIconUrl: ethSmall,
      swapIconUrl: swapIcon,
      boltIconUrl: boltIcon,
    },
  },
];

const variants: Variant[] = [
  ...tier1Variants.map((v) => ({ name: v.name, element: createElement(SwapBannerTier1, v.props) })),
  ...tier23Variants.map((v) => ({ name: v.name, element: createElement(SwapBanner, v.props) })),
];

const outDir = join(root, 'out');
await mkdir(outDir, { recursive: true });

for (const variant of variants) {
  const png = await renderBanner(variant.element);
  const outPath = join(outDir, `${variant.name}.png`);
  await writeFile(outPath, png);
  console.log(`✓ ${outPath}`);
}
