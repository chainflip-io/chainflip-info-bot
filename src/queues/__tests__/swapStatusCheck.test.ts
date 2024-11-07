import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import pendingSwapStats from './pendingSwapStats.json' with { type: 'json' };
import swapInfoStats from '../../queries/__tests__/swapInfo.json' with { type: 'json' };

import { explorerClient } from '../../server.js';
import { config } from '../swapStatusCheck.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('swapStatusCheck', () => {
  it('check fresh swap status and send swap info message', async () => {
    vi.setSystemTime(new Date('2024-10-25T12:42:30+00:00'));
    vi.mocked(explorerClient.request).mockResolvedValue(swapInfoStats);

    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '77697',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
  });

  it('check pending swap status and move to a scheduler', async () => {
    vi.setSystemTime(new Date('2024-10-25T12:42:30+00:00'));
    vi.mocked(explorerClient.request).mockResolvedValue(pendingSwapStats);

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '77697',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [
          {
            "data": [
              {
                "data": {
                  "swapRequestId": "77697",
                },
                "name": "swapStatusCheck",
                "opts": {
                  "delay": 10000,
                },
              },
            ],
            "name": "scheduler",
          },
        ],
      ]
    `);
  });

  it('check stale swap status', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue(swapInfoStats);

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '77697',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [],
      ]
    `);
  });
});
