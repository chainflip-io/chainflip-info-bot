import { describe, it, expect, vi } from 'vitest';
import Config from '../config.js';
vi.mock('fs/promises');
vi.mock('../env.js', () => ({
  default: {
    CONFIG: JSON.stringify({
      discord: {
        channels: [
          {
            webhookUrl: 'https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKL',
            allowedMessageTypes: ['NEW_SWAP'],
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
            allowedMessageTypes: ['NEW_SWAP'],
          },
        ],
      },
    }),
  },
}));

describe('readConfig', () => {
  it('returns the channels', async () => {
    // the function is memoized, so we need to reset

    expect(await Config.getChannels('telegram')).toMatchInlineSnapshot(`
      [
        {
          "allowedMessageTypes": undefined,
          "key": "telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8",
        },
        {
          "allowedMessageTypes": [
            "NEW_SWAP",
          ],
          "key": "telegram:01302f476e11cc5762723b8d2f4fd011be6ff939",
        },
      ]
    `);
    expect(await Config.getChannels('discord')).toMatchInlineSnapshot(`
      [
        {
          "allowedMessageTypes": [
            "NEW_SWAP",
          ],
          "key": "discord:c02f7e59411e675118304c2abb7e77980d08a44f",
        },
        {
          "allowedMessageTypes": undefined,
          "key": "discord:0a0169ea140fc2f7c7b19ad10dd44917f6059b9d",
        },
      ]
    `);
  });

  it.each([
    'telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8',
    'discord:c02f7e59411e675118304c2abb7e77980d08a44f',
  ] as const)('returns the config for a key (%s)', async (key) => {
    expect(await Config.get(key)).toMatchSnapshot();
  });

  it('throws an error if the key is not found', async () => {
    await expect(Config.get('telegram:invalid')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Config not found: telegram:invalid]`,
    );
  });
});
