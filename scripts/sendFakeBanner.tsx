#!/usr/bin/env tsx
import 'dotenv/config';
import { AttachmentBuilder, Client, GatewayIntentBits } from 'discord.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { fileToDataUrl, renderBanner } from '../src/banners/render.js';
import { SwapBannerTier1, type SwapBannerTier1Props } from '../src/banners/SwapBannerTier1.js';

const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
if (!token || !channelId) {
  throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID in .env');
}

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), '../src/banners/assets');
const asset = (p: string) => fileToDataUrl(join(assetsDir, p));

const [btcLarge, btcSmall, usdtLarge, usdtSmall, tronChain, swapIcon, boltIcon, background] =
  await Promise.all([
    asset('tokens/btc.png'),
    asset('tokens/bitcoin small.png'),
    asset('tokens/usdt.png'),
    asset('tokens/usdt.png'),
    asset('chains/tron.png'),
    asset('swap-icon.png'),
    asset('tokens/bolt.png'),
    asset('backgrounds/tier1-boosted.png'),
  ]);

const props: SwapBannerTier1Props = {
  usdValue: 420_000,
  isBoosted: true,
  sourceAsset: { iconUrl: btcLarge, symbol: 'BTC', amount: 3.96 },
  destAsset: { iconUrl: usdtLarge, symbol: 'USDT', amount: 420_000, chainBadgeUrl: tronChain },
  durationMinutes: 9,
  originalDurationMinutes: 39,
  aggregator: 'thorswap',
  oraclePriceDeltaPct: -0.04,
  backgroundUrl: background,
  smallSourceIconUrl: btcSmall,
  smallDestIconUrl: usdtSmall,
  swapIconUrl: swapIcon,
  boltIconUrl: boltIcon,
};

console.log('Building banner...');
const png = await renderBanner(createElement(SwapBannerTier1, props));

console.log('Connecting to Discord...');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await new Promise<void>((resolve, reject) => {
  client.once('ready', () => resolve());
  client.once('error', reject);
  client.login(token).catch(reject);
});

const channel = await client.channels.fetch(channelId);
if (!channel?.isSendable()) {
  await client.destroy();
  throw new Error(`Channel ${channelId} not sendable`);
}

console.log('Posting...');
await channel.send({
  content:
    'SWAP\n$420,000\n\n3.96 BTC → 420,000 USDT.trx\n\nBroker: @thorswap\nScan: https://scan.chainflip.io/swaps/9999999',
  files: [new AttachmentBuilder(png, { name: 'banner.png' })],
});

console.log('✓ Posted');
await client.destroy();
