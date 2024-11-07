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
      channels: [
        {
          webhookUrl: 'https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKL',
          filters: [{ name: 'NEW_SWAP', minUsdValue: 1 }],
          name: 'discord 1',
        },
        {
          enabled: false,
          webhookUrl: 'https://discord.com/api/webhooks/1234567890/MNOPQRSTUVWXYZ',
          name: 'discord 2',
        },
        {
          enabled: true,
          webhookUrl: 'https://discord.com/api/webhooks/1234567890/∂',
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
} as RawEnv;
