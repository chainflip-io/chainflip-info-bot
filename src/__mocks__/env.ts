import { RawEnv } from '../env.js';

export default {
  REDIS_URL: 'redis://localhost:6379',
  HTTP_SERVER_PORT: '8080',
  EXPLORER_GATEWAY_URL: 'https://chainflap-explor.org/graphql',
  LP_GATEWAY_URL: 'https://chainflap-lp.org/graphql',
  CONFIG: JSON.stringify({
    discord: {
      channels: [
        {
          webhookUrl: 'https://discord.com/api/webhooks/1234567890/abcdefg',
        },
      ],
    },
    telegram: {
      botToken: '8675309:asdfasdfasidfbskdjfb',
      channels: [
        {
          channelId: '1234',
        },
      ],
    },
  }),
} as RawEnv;
