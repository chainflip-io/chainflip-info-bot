import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config } from '../newSwapAlert.js';

describe('newSwapAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('processJob', () => {
    it('dispatches a job to send a message', async () => {
      vi.setSystemTime(new Date('2024-10-25T12:42:30+00:00'));

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: {
          swapRequestId: '77697',
        } as JobData['newSwapAlert'],
      } as any);

      expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
    });
  });

  it('skips stale swaps', async () => {
    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '77697',
      } as JobData['newSwapAlert'],
    } as any);

    expect(dispatchJobs).not.toHaveBeenCalled();
  });
});
