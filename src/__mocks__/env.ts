import type { ConfigFile } from '../config.js';
import type { RawEnv } from '../env.js';

export default {
  REDIS_URL: 'redis://localhost:6379',
  HTTP_SERVER_PORT: 8080,
  EXPLORER_GATEWAY_URL: 'https://chainflap-explor.org/graphql',
  LP_GATEWAY_URL: 'https://chainflap-lp.org/graphql',
  CONFIG: JSON.stringify({
    discord: {
      channels: [
        {
          webhookUrl: 'https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKL',
          filters: [{ name: 'NEW_SWAP', usdValue: 1 }],
        },
        {
          enabled: false,
          webhookUrl: 'https://discord.com/api/webhooks/1234567890/MNOPQRSTUVWXYZ',
        },
        {
          enabled: true,
          webhookUrl: 'https://discord.com/api/webhooks/1234567890/∂',
        },
      ],
    },
    telegram: {
      botToken: 'bot token',
      channels: [
        {
          channelId: '123',
        },
        {
          enabled: false,
          channelId: 345,
        },
        {
          enabled: true,
          channelId: '567',
          filters: [{ name: 'NEW_SWAP', usdValue: 1 }],
        },
      ],
    },
  } as ConfigFile),
} as RawEnv;
