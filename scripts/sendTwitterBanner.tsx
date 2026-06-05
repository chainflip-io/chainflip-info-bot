#!/usr/bin/env tsx
import 'dotenv/config';
import { buildBanner, type SwapBannerData } from '../src/banners/buildBanner.js';
import { formatDiscordMessage } from '../src/banners/discordMessage.js';
import { sendMessage, uploadMedia, type TwitterConfig } from '../src/channels/twitter.js';

// `--upload-only` validates creds + OAuth + media-upload API access WITHOUT posting
// anything public (the uploaded media_id simply expires unused). Use this first.
const uploadOnly = process.argv.includes('--upload-only');

const config: TwitterConfig = {
  consumerKey: process.env.TWITTER_CONSUMER_KEY!,
  consumerKeySecret: process.env.TWITTER_CONSUMER_KEY_SECRET!,
  oauthKey: process.env.TWITTER_OAUTH_KEY!,
  oauthKeySecret: process.env.TWITTER_OAUTH_KEY_SECRET!,
};

const missing = Object.entries(config)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  throw new Error(
    `Missing Twitter creds in .env: ${missing.join(', ')}. ` +
      `Set TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_KEY_SECRET, TWITTER_OAUTH_KEY, TWITTER_OAUTH_KEY_SECRET.`,
  );
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

// Same caption the live pipeline builds for twitter (resolves @handles, tier-aware).
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

if (uploadOnly) {
  console.log(`Uploading media only (${png.length} bytes), no tweet will be posted...`);
  const mediaId = await uploadMedia(config, png);
  console.log(
    `✓ Media upload OK — media_id ${mediaId} (expires unused). Creds + API tier validated.`,
  );
} else {
  console.log(`Posting to X (${png.length} bytes, ${message.length} char caption)...`);
  console.log('---\n' + message + '\n---');
  await sendMessage(config, message, png);
  console.log('✓ Posted to X');
}
