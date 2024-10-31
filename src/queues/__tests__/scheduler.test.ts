import { describe, expect, it, vi } from 'vitest';
import { config } from '../scheduler.js';

describe('scheduler', () => {
  it('forwards the job data to the dispatchJobs function', async () => {
    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: [
        {
          name: 'scheduler',
          data: [],
        },
        {
          name: 'sendMessage',
          data: {
            key: 'telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8',
            message: 'Hello, world!',
          },
        },
      ] as JobData['scheduler'],
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
});
