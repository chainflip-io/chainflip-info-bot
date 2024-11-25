import type { ConfigFile } from '../config.js';
import type { RawEnv } from '../env.js';

export default {
  REDIS_URL: 'redis://localhost:6379',
  HTTP_SERVER_PORT: 8080,
  EXPLORER_GATEWAY_URL: 'https://chainflap-explor.org/graphql',
  LP_GATEWAY_URL: 'https://chainflap-lp.org/graphql',
  SWAP_MAX_AGE_IN_MINUTES: 10,
  CONFIG: JSON.stringify({
    discord: {
      botToken: 'discord bot token',
      channels: [
        {
          filters: [{ name: 'NEW_SWAP', minUsdValue: 1 }],
          channelId: 'discord channel id 1',
          name: 'discord 1',
        },
        {
          enabled: false,
          channelId: 'discord channel id 2',
          name: 'discord 2',
        },
        {
          enabled: true,
          channelId: 'discord channel id 3',
          name: 'discord 3',
        },
      ],
    },
    telegram: {
      botToken: 'bot token',
      channels: [
        {
          channelId: '123',
          name: 'telegram 1',
        },
        {
          enabled: false,
          channelId: 345,
          name: 'telegram 2',
        },
        {
          enabled: true,
          channelId: '567',
          filters: [{ name: 'NEW_SWAP', minUsdValue: 1 }],
          name: 'telegram 3',
        },
      ],
    },
    twitter: {
      channels: [
        {
          enabled: true,
          name: 'twitter 1',
          consumerKey: 'xxx',
          consumerKeySecret: 'xxx',
          oauthKey: 'xxx',
          oauthKeySecret: 'xxx',
        },
      ],
    },
  } as ConfigFile),
  HEALTH_CHECK_GRACE_PERIOD_MS: 10_000,
} as RawEnv;
