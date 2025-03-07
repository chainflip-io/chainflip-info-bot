import { describe, expect, it, vi } from 'vitest';
import Config from '../../config.js';
import { config } from '../messageRouter.js';

describe('messageRouter', () => {
  it('sends messages to the correct telegram channels', async () => {
    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        platform: 'telegram',
        message: 'Hello, world!',
        filterData: { name: 'DAILY_SWAP_SUMMARY' },
      } as JobData['messageRouter'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [
          {
            "data": {
              "key": "telegram:telegram_1",
              "message": "Hello, world!",
              "opts": undefined,
            },
            "name": "sendMessage",
          },
        ],
      ]
    `);
  });
  it('sends messages to the correct discord channels', async () => {
    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        platform: 'discord',
        message: 'Hello, world!',
        filterData: { name: 'DAILY_SWAP_SUMMARY' },
      } as JobData['messageRouter'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [
          {
            "data": {
              "key": "discord:discord_3",
              "message": "Hello, world!",
              "opts": undefined,
            },
            "name": "sendMessage",
          },
        ],
      ]
    `);
  });

  it('sends messages to the correct twitter channels', async () => {
    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        platform: 'twitter',
        message: 'Hello, world!',
        filterData: { name: 'DAILY_SWAP_SUMMARY' },
      } as JobData['messageRouter'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [
          {
            "data": {
              "key": "twitter:twitter_1",
              "message": "Hello, world!",
              "opts": undefined,
            },
            "name": "sendMessage",
          },
        ],
      ]
    `);
  });

  it('does nothing if no channels are configured', async () => {
    vi.spyOn(Config, 'getChannels').mockResolvedValue([]);

    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        platform: 'telegram',
        message: 'Hello, world!',
        filterData: { name: 'DAILY_SWAP_SUMMARY' },
      } as JobData['messageRouter'],
    } as any);

    expect(dispatchJobs).not.toHaveBeenCalled();
  });
});
