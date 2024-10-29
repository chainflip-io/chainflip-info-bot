import { utc } from '@date-fns/utc';
import { BigNumber } from 'bignumber.js';
import { Job } from 'bullmq';
import { endOfDay } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getSwapVolumeStats from '../../queries/swapVolume.js';
import { config } from '../timePeriodStats.js';

vi.mock('../../queries/swapVolume.js');

describe('time period stats', () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  describe('initialize', () => {
    it('primes the queue', async () => {
      vi.setSystemTime(new Date('2024-10-25T12:34:56Z'));

      const queue = { add: vi.fn() };

      await config.initialize?.(queue as any);
      expect(queue.add.mock.lastCall).toMatchInlineSnapshot(`
        [
          "timePeriodStats",
          {
            "endOfPeriod": 1729900799999,
            "sendWeeklySummary": false,
          },
          {
            "delay": 41103999,
            "jobId": "timePeriodStatsSingleton-1729900799999",
          },
        ]
      `);
    });

    it('primes the queue with the weekly job', async () => {
      vi.setSystemTime(new Date('2024-10-27T12:34:56Z'));

      const queue = { add: vi.fn() };

      await config.initialize?.(queue as any);
      expect(queue.add.mock.lastCall).toMatchInlineSnapshot(`
        [
          "timePeriodStats",
          {
            "endOfPeriod": 1730073599999,
            "sendWeeklySummary": true,
          },
          {
            "delay": 41103999,
            "jobId": "timePeriodStatsSingleton-1730073599999",
          },
        ]
      `);
    });
  });

  describe('processJob', () => {
    it('processes a daily job', async () => {
      vi.setSystemTime(new Date('2024-10-25T12:34:56Z'));
      vi.mocked(getSwapVolumeStats)
        .mockResolvedValueOnce({
          flipBurned: new BigNumber('1000.00'),
          lpFees: new BigNumber('2000.00'),
          networkFees: new BigNumber('3000.00'),
          swapVolume: new BigNumber('4000.00'),
        })
        .mockRejectedValue(Error('unexpected call'));

      const dispatchJobs = vi.fn();

      const endOfPeriod = endOfDay(new Date('2024-10-25T12:34:56Z'), { in: utc });

      await config.processJob(dispatchJobs)({
        data: { endOfPeriod: endOfPeriod.valueOf(), sendWeeklySummary: false },
      } as Job<JobData['timePeriodStats'], any, any>);

      expect(dispatchJobs.mock.calls).toMatchSnapshot();
      expect(vi.mocked(getSwapVolumeStats).mock.calls).toMatchInlineSnapshot(`
        [
          [
            2024-10-25T00:00:00.000Z,
            2024-10-25T23:59:59.999Z,
          ],
        ]
      `);
    });

    it('processes a daily job without a flip burn', async () => {
      vi.setSystemTime(new Date('2024-10-25T12:34:56Z'));
      vi.mocked(getSwapVolumeStats)
        .mockResolvedValueOnce({
          flipBurned: null,
          lpFees: new BigNumber('2000.00'),
          networkFees: new BigNumber('3000.00'),
          swapVolume: new BigNumber('4000.00'),
        })
        .mockRejectedValue(Error('unexpected call'));

      const dispatchJobs = vi.fn();

      const endOfPeriod = endOfDay(new Date('2024-10-25T12:34:56Z'), { in: utc });

      await config.processJob(dispatchJobs)({
        data: { endOfPeriod: endOfPeriod.valueOf(), sendWeeklySummary: false },
      } as Job<JobData['timePeriodStats'], any, any>);

      expect(dispatchJobs.mock.calls).toMatchSnapshot();
    });

    it('processes a daily and weekly job', async () => {
      vi.setSystemTime(new Date('2024-10-27T12:34:56Z'));
      vi.mocked(getSwapVolumeStats)
        .mockResolvedValueOnce({
          flipBurned: new BigNumber('1000.00'),
          lpFees: new BigNumber('2000.00'),
          networkFees: new BigNumber('3000.00'),
          swapVolume: new BigNumber('4000.00'),
        })
        .mockResolvedValueOnce({
          flipBurned: new BigNumber('1000.00').times(7),
          lpFees: new BigNumber('2000.00').times(7),
          networkFees: new BigNumber('3000.00').times(7),
          swapVolume: new BigNumber('4000.00').times(7),
        })
        .mockRejectedValue(Error('unexpected call'));

      const dispatchJobs = vi.fn();

      const endOfPeriod = endOfDay(new Date('2024-10-27T12:34:56Z'), { in: utc });

      await config.processJob(dispatchJobs)({
        data: { endOfPeriod: endOfPeriod.valueOf(), sendWeeklySummary: true },
      } as Job<JobData['timePeriodStats'], any, any>);

      expect(dispatchJobs.mock.calls).toMatchSnapshot();
      expect(vi.mocked(getSwapVolumeStats).mock.calls).toMatchInlineSnapshot(`
        [
          [
            2024-10-27T00:00:00.000Z,
            2024-10-27T23:59:59.999Z,
          ],
          [
            2024-10-21T00:00:00.000Z,
            2024-10-27T23:59:59.999Z,
          ],
        ]
      `);
    });
  });
});
