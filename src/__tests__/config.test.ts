import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ConfigFile } from '../config.js';
import env from '../env.js';

vi.mock('../env.js', () => ({
  default: {
    CONFIG: JSON.stringify({
      discord: {
        botToken: 'discord bot token',
        channels: [
          {
            channelId: 'channel1',
            filters: [{ name: 'SWAP_COMPLETED', minUsdValue: 1 }],
            name: 'discord 1',
          },
          {
            enabled: false,
            channelId: 'channel2',
            name: 'discord 2',
          },
          {
            enabled: true,
            channelId: 'channel3',
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
            filters: [{ name: 'SWAP_COMPLETED', minUsdValue: 1 }],
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
    }),
  },
}));

describe('Config', () => {
  let Config: typeof import('../config.js').default;

  beforeEach(() => {
    vi.resetModules();
  });

  describe('Config.getChannels', () => {
    beforeEach(async () => {
      Config = (await import('../config.js')).default;
    });

    it('returns the channels', async () => {
      expect(await Config.getChannels('telegram')).toMatchInlineSnapshot(`
        [
          {
            "filters": undefined,
            "key": "telegram:telegram_1",
          },
          {
            "filters": [
              {
                "minUsdValue": 1,
                "name": "SWAP_COMPLETED",
              },
            ],
            "key": "telegram:telegram_3",
          },
        ]
      `);
      expect(await Config.getChannels('discord')).toMatchInlineSnapshot(`
        [
          {
            "filters": [
              {
                "minUsdValue": 1,
                "name": "SWAP_COMPLETED",
              },
            ],
            "key": "discord:discord_1",
          },
          {
            "filters": undefined,
            "key": "discord:discord_3",
          },
        ]
      `);

      expect(await Config.getChannels('twitter')).toMatchInlineSnapshot(`
        [
          {
            "filters": undefined,
            "key": "twitter:twitter_1",
          },
        ]
      `);
    });
  });

  describe('Config.get', () => {
    beforeEach(async () => {
      Config = (await import('../config.js')).default;
    });

    it.each(['telegram:telegram_1', 'discord:discord_1', 'twitter:twitter_1'] as const)(
      'returns the config for a key (%s)',
      async (key) => {
        expect(await Config.get(key)).toMatchSnapshot();
      },
    );

    it('throws an error if the key is not found', async () => {
      await expect(Config.get('telegram:invalid')).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Config not found: telegram:invalid]`,
      );
    });

    it('throws an error if the key is not found', async () => {
      await expect(Config.get('twitter:invalid')).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Config not found: twitter:invalid]`,
      );
    });
  });

  describe('Config.canSend', () => {
    beforeEach(async () => {
      Config = (await import('../config.js')).default;
    });

    it('works with simple filters', () => {
      expect(Config.canSend({ key: 'discord:1234' }, { name: 'DAILY_SWAP_SUMMARY' })).toBe(true);
      expect(
        Config.canSend(
          { filters: [{ name: 'DAILY_SWAP_SUMMARY' }], key: 'discord:1234' },
          { name: 'DAILY_SWAP_SUMMARY' },
        ),
      ).toBe(true);
      expect(
        Config.canSend(
          { filters: [{ name: 'DAILY_SWAP_SUMMARY' }], key: 'discord:1234' },
          { name: 'WEEKLY_SWAP_SUMMARY' },
        ),
      ).toBe(false);
    });

    it('works with SWAP_COMPLETED', () => {
      expect(
        Config.canSend(
          { key: 'discord:1234', filters: [{ name: 'SWAP_COMPLETED', minUsdValue: 100 }] },
          { name: 'SWAP_COMPLETED', usdValue: 50 },
        ),
      ).toBe(false);
      expect(
        Config.canSend(
          { key: 'discord:1234', filters: [{ name: 'SWAP_COMPLETED', minUsdValue: 100 }] },
          { name: 'SWAP_COMPLETED', usdValue: 150 },
        ),
      ).toBe(true);
    });
  });

  describe('Config.load', () => {
    it('memoizes the result', async () => {
      const spy = vi.spyOn(env, 'CONFIG', 'get').mockReturnValue(
        JSON.stringify({
          telegram: {
            botToken: 'test',
            channels: [{ name: 'telegram_1', channelId: '123' }],
          },
        }),
      );

      Config = (await import('../config.js')).default;

      await Config.get('telegram:telegram_1');
      await Config.get('telegram:telegram_1');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('throws if channel names are not unique', async () => {
      const configFile: ConfigFile = {
        telegram: {
          botToken: 'telegram_bot_token',
          channels: [
            {
              name: 'some really unique channel name',
              channelId: '1234',
            },
            {
              name: 'some really unique channel name',
              channelId: '5678',
            },
          ],
        },
      };
      vi.spyOn(env, 'CONFIG', 'get').mockReturnValue(JSON.stringify(configFile));
      Config = (await import('../config.js')).default;

      await expect(
        Config.get('telegram:some_really_unique_channel_name'),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[AssertionError: channel names must be unique]`,
      );
    });

    it('allows duplicate channel names across different platforms', async () => {
      const configFile: ConfigFile = {
        telegram: {
          botToken: 'telegram_bot_token',
          channels: [
            {
              name: 'some really unique channel name',
              channelId: '1234',
            },
          ],
        },
        discord: {
          botToken: 'discord_bot_token',
          channels: [
            {
              name: 'some really unique channel name',
              channelId: 'channel1',
            },
          ],
        },
      };
      vi.spyOn(env, 'CONFIG', 'get').mockReturnValue(JSON.stringify(configFile));
      Config = (await import('../config.js')).default;

      await expect(
        Config.get('telegram:some_really_unique_channel_name'),
      ).resolves.not.toThrowError();
    });
  });
});
