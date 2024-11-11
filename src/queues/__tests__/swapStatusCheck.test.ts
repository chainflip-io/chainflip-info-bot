import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import pendingSwapStats from './pendingSwapStats.json' with { type: 'json' };

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

  it('contains affiliate broker info in swap message', async () => {
    vi.setSystemTime(new Date('2024-11-10T18:46:00.001+00:00'));
    const nativeId = '106495';

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: nativeId,
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
  });

  it('subtracts out the refund egress amount from the ingress amount', async () => {
    vi.setSystemTime(new Date('2024-11-07T21:53:48+00:00'));

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '103045',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
  });

  it('ignores fully refunded swaps', async () => {
    const swapRequestId = '103706';
    vi.setSystemTime(new Date('2024-11-08T13:08:42+00:00'));

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId,
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs).not.toHaveBeenCalled();
  });

  it('adds boost info', async () => {
    const swapRequestId = '103899';
    vi.setSystemTime(new Date('2024-11-08T15:28:36+00:00'));

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId,
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.calls).toMatchSnapshot();
  });
});
