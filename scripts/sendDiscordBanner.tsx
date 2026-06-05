#!/usr/bin/env tsx
import 'dotenv/config';
import { AttachmentBuilder, Client, GatewayIntentBits } from 'discord.js';
import { buildBanner, type SwapBannerData } from '../src/banners/buildBanner.js';
import { formatDiscordMessage } from '../src/banners/discordMessage.js';

const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
if (!token || !channelId) {
  throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID in .env');
}

const banner: SwapBannerData = {
  usdValue: 1_284_450,
  isBoosted: true,
  sourceAsset: 'Btc',
  sourceAmount: 12.5,
  destAsset: 'Usdc',
  destAmount: 1_284_450,
  durationMinutes: 12,
  originalDurationMinutes: 42,
  aggregator: 'swap.chainflip.io',
  oraclePriceDeltaPct: -0.07,
};

const message = formatDiscordMessage({
  usdValue: banner.usdValue,
  sourceAsset: banner.sourceAsset,
  sourceAmount: banner.sourceAmount,
  destAsset: banner.destAsset,
  destAmount: banner.destAmount,
  brokerAlias: 'swap.chainflip.io',
  affiliateAlias: 'Rango Direct',
  swapId: '847291',
  isBoosted: banner.isBoosted,
  durationMinutes: banner.durationMinutes,
  originalDurationMinutes: banner.originalDurationMinutes,
  oraclePriceDeltaPct: banner.oraclePriceDeltaPct,
});

console.log('Building banner...');
const png = await buildBanner(banner);

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
  content: message,
  files: [new AttachmentBuilder(png, { name: 'banner.png' })],
});

console.log('✓ Posted');
await client.destroy();
