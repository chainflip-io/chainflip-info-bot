import { describe, expect, it, vi } from 'vitest';
import Config from '../../config.js';
import { config } from '../messageRouter.js';

vi.mock('../../config.js');

describe('messageRouter', () => {
  it('sends messages to the correct channels', async () => {
    vi.mocked(Config.getChannels).mockResolvedValue([
      {
        key: 'telegram:123',
      },
      {
        key: 'telegram:456',
        allowedMessageTypes: ['NEW_SWAP'],
      },
      {
        key: 'discord:123',
        allowedMessageTypes: ['DAILY_SUMMARY'],
      },
    ]);

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
              "key": "telegram:123",
              "message": "Hello, world!",
            },
            "name": "sendMessage",
          },
          {
            "data": {
              "key": "discord:123",
              "message": "Hello, world!",
            },
            "name": "sendMessage",
          },
        ],
      ]
    `);
  });

  it('does nothing if no channels are configured', async () => {
    vi.mocked(Config.getChannels).mockResolvedValue([]);

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
