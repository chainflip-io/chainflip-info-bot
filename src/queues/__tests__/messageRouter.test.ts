import { describe, expect, it, vi } from 'vitest';
import Config from '../../config.js';
import { config } from '../messageRouter.js';

describe('messageRouter', () => {
  it('sends messages to the correct telegram channels', async () => {
    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        channel: 'telegram',
        message: 'Hello, world!',
        messageType: 'DAILY_SUMMARY',
      } as JobData['messageRouter'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [
          {
            "data": {
              "key": "telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8",
              "message": "Hello, world!",
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
        channel: 'discord',
        message: 'Hello, world!',
        messageType: 'DAILY_SUMMARY',
      } as JobData['messageRouter'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [
          {
            "data": {
              "key": "discord:0a0169ea140fc2f7c7b19ad10dd44917f6059b9d",
              "message": "Hello, world!",
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
        channel: 'telegram',
        message: 'Hello, world!',
        messageType: 'DAILY_SUMMARY',
      } as JobData['messageRouter'],
    } as any);

    expect(dispatchJobs).not.toHaveBeenCalled();
  });
});
