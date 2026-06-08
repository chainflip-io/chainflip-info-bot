#!/usr/bin/env tsx
import 'dotenv/config';
import { AttachmentBuilder, Client, GatewayIntentBits } from 'discord.js';
import { buildBanner, type SwapBannerData } from '../src/banners/buildBanner.js';
import { formatDiscordMessage, type DiscordMessageInput } from '../src/banners/discordMessage.js';

const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
if (!token || !channelId) {
  throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID in .env');
}

type Example = {
  label: string;
  banner: SwapBannerData;
  message: Omit<DiscordMessageInput, keyof SwapBannerData> & {
    brokerAlias?: string;
    affiliateAlias?: string;
    swapId: string;
  };
};

const examples: Example[] = [
  {
    label: '1) Tier 1 regular — integrator only',
    banner: {
      usdValue: 250_000,
      isBoosted: false,
      sourceAsset: 'Eth',
      sourceAmount: 78.5,
      destAsset: 'Btc',
      destAmount: 2.35,
      durationMinutes: 5,
      aggregator: 'Rango',
      oraclePriceDeltaPct: -0.04,
    },
    message: {
      brokerAlias: undefined,
      affiliateAlias: 'Rango Direct',
      swapId: '1000001',
    },
  },
  {
    label: '2) Tier 1 boosted — integrator + Chainflip default broker (broker dropped)',
    banner: {
      usdValue: 420_000,
      isBoosted: true,
      sourceAsset: 'Btc',
      sourceAmount: 3.96,
      destAsset: 'Usdt',
      destAmount: 420_000,
      durationMinutes: 9,
      originalDurationMinutes: 39,
      aggregator: 'THORSwap',
      oraclePriceDeltaPct: -0.04,
    },
    message: {
      brokerAlias: 'swap.chainflip.io',
      affiliateAlias: 'THORSwap UI',
      swapId: '1000002',
    },
  },
  {
    label: '3) Tier 2 regular — integrator + third-party broker',
    banner: {
      usdValue: 620_000,
      isBoosted: false,
      sourceAsset: 'Usdc',
      sourceAmount: 620_000,
      destAsset: 'Sol',
      destAmount: 4250,
      durationMinutes: 3,
      aggregator: 'Jumper',
      oraclePriceDeltaPct: -0.02,
    },
    message: {
      brokerAlias: 'SwapKit',
      affiliateAlias: 'Jumper',
      swapId: '1000003',
    },
  },
  {
    label: '4) Tier 2 boosted — broker only, no integrator',
    banner: {
      usdValue: 750_000,
      isBoosted: true,
      sourceAsset: 'Btc',
      sourceAmount: 7.08,
      destAsset: 'Usdc',
      destAmount: 750_000,
      durationMinutes: 8,
      originalDurationMinutes: 38,
      aggregator: 'SwapKit',
      oraclePriceDeltaPct: 0.05,
    },
    message: {
      brokerAlias: 'SwapKit',
      affiliateAlias: undefined,
      swapId: '1000004',
    },
  },
  {
    label: '5) Tier 3 regular — integrator + Chainflip default broker (broker dropped)',
    banner: {
      usdValue: 1_280_000,
      isBoosted: false,
      sourceAsset: 'Usdc',
      sourceAmount: 1_280_000,
      destAsset: 'Btc',
      destAmount: 12.05,
      durationMinutes: 2,
      aggregator: 'Trust Wallet',
      oraclePriceDeltaPct: 0.01,
    },
    message: {
      brokerAlias: 'Chainflip SDK',
      affiliateAlias: 'Trust Wallet',
      swapId: '1000005',
    },
  },
  {
    label: '6) Tier 3 boosted — integrator + third-party broker',
    banner: {
      usdValue: 2_500_000,
      isBoosted: true,
      sourceAsset: 'Eth',
      sourceAmount: 936,
      destAsset: 'Btc',
      destAmount: 23.5,
      durationMinutes: 11,
      originalDurationMinutes: 41,
      aggregator: 'Rango',
      oraclePriceDeltaPct: -0.06,
    },
    message: {
      brokerAlias: 'THORSwap',
      affiliateAlias: 'Rango Direct',
      swapId: '1000006',
    },
  },
];

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

for (const ex of examples) {
  console.log(`Posting: ${ex.label}`);
  const message = formatDiscordMessage({
    usdValue: ex.banner.usdValue,
    sourceAsset: ex.banner.sourceAsset,
    sourceAmount: ex.banner.sourceAmount,
    destAsset: ex.banner.destAsset,
    destAmount: ex.banner.destAmount,
    isBoosted: ex.banner.isBoosted,
    durationMinutes: ex.banner.durationMinutes,
    originalDurationMinutes: ex.banner.originalDurationMinutes,
    oraclePriceDeltaPct: ex.banner.oraclePriceDeltaPct,
    ...ex.message,
  });
  const png = await buildBanner(ex.banner);
  await channel.send({
    content: `**${ex.label}**\n\n${message}`,
    files: [new AttachmentBuilder(png, { name: 'banner.png' })],
  });
  await new Promise((r) => setTimeout(r, 500));
}

console.log('✓ All posted');
await client.destroy();
