import { beforeEach } from 'node:test';
import { describe, it, expect, vi } from 'vitest';
import Config from '../config.js';

describe('Config', () => {
  describe('Config.getChannels', () => {
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
                "name": "NEW_SWAP",
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
                "name": "NEW_SWAP",
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

    it('works with NEW_SWAP', () => {
      expect(
        Config.canSend(
          { key: 'discord:1234', filters: [{ name: 'NEW_SWAP', minUsdValue: 100 }] },
          { name: 'NEW_SWAP', usdValue: 50 },
        ),
      ).toBe(false);
      expect(
        Config.canSend(
          { key: 'discord:1234', filters: [{ name: 'NEW_SWAP', minUsdValue: 100 }] },
          { name: 'NEW_SWAP', usdValue: 150 },
        ),
      ).toBe(true);
    });
  });

  describe('Config.load', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it.todo('throws if channel names are not unique');
  });
});
