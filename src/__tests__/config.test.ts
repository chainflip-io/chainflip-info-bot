import { describe, it, expect, vi } from 'vitest';
import Config from '../config.js';
vi.mock('fs/promises');

describe('Config', () => {
  describe('Config.getChannels', () => {
    it('returns the channels', async () => {
      expect(await Config.getChannels('telegram')).toMatchInlineSnapshot(`
      [
        {
          "key": "telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8",
          "rules": undefined,
        },
        {
          "key": "telegram:01302f476e11cc5762723b8d2f4fd011be6ff939",
          "rules": undefined,
        },
      ]
    `);
      expect(await Config.getChannels('discord')).toMatchInlineSnapshot(`
      [
        {
          "key": "discord:c02f7e59411e675118304c2abb7e77980d08a44f",
          "rules": undefined,
        },
        {
          "key": "discord:0a0169ea140fc2f7c7b19ad10dd44917f6059b9d",
          "rules": undefined,
        },
      ]
    `);
    });
  });

  describe('Config.get', () => {
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

  describe('Config.canSend', () => {
    it('works with simple rules', () => {
      expect(Config.canSend({ key: 'discord:1234' }, { name: 'DAILY_SUMMARY' })).toBe(true);
      expect(
        Config.canSend(
          { rules: [{ name: 'DAILY_SUMMARY' }], key: 'discord:1234' },
          { name: 'DAILY_SUMMARY' },
        ),
      ).toBe(true);
      expect(
        Config.canSend(
          { rules: [{ name: 'DAILY_SUMMARY' }], key: 'discord:1234' },
          { name: 'WEEKLY_SUMMARY' },
        ),
      ).toBe(false);
    });

    it('works with NEW_SWAP', () => {
      expect(
        Config.canSend(
          { key: 'discord:1234', rules: [{ name: 'NEW_SWAP', usdValue: 100 }] },
          { name: 'NEW_SWAP', usdValue: 50 },
        ),
      ).toBe(false);
      expect(
        Config.canSend(
          { key: 'discord:1234', rules: [{ name: 'NEW_SWAP', usdValue: 100 }] },
          { name: 'NEW_SWAP', usdValue: 150 },
        ),
      ).toBe(true);
    });
  });
});
