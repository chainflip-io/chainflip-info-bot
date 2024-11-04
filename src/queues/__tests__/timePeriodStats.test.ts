import { utc } from '@date-fns/utc';
import { BigNumber } from 'bignumber.js';
import { Job } from 'bullmq';
import { endOfDay } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getLpFills from '../../queries/lpFills.js';
import getSwapVolumeStats from '../../queries/swapVolume.js';
import { config } from '../timePeriodStats.js';

vi.mock('../../queries/swapVolume.js');
vi.mock('../../queries/lpFills.js');

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
            "deduplication": {
              "id": "timePeriodStats-1729900799999",
            },
            "delay": 41103999,
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
            "deduplication": {
              "id": "timePeriodStats-1730073599999",
            },
            "delay": 41103999,
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
          boostFees: new BigNumber('5000.00'),
        })
        .mockRejectedValue(Error('unexpected call'));

      vi.mocked(getLpFills)
        .mockResolvedValueOnce([
          {
            idSs58: 'cFMboYsd4HvERKXX11LyvZXuTcQzV7KAe9ipP4La5vUs8fd4e',
            alias: 'ChainflipGod',
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '50.00',
          },
          {
            idSs58: 'cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '50.00',
          },
        ])
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
      expect(vi.mocked(getLpFills).mock.calls).toMatchInlineSnapshot(`
        [
          [
            {
              "end": "2024-10-25T23:59:59.999Z",
              "start": "2024-10-25T00:00:00.000Z",
            },
          ],
        ]
      `);
    });

    it('processes a daily job without a flip burn or boost fees', async () => {
      vi.setSystemTime(new Date('2024-10-25T12:34:56Z'));
      vi.mocked(getSwapVolumeStats)
        .mockResolvedValueOnce({
          flipBurned: null,
          lpFees: new BigNumber('2000.00'),
          networkFees: new BigNumber('3000.00'),
          swapVolume: new BigNumber('4000.00'),
          boostFees: new BigNumber(0),
        })
        .mockRejectedValue(Error('unexpected call'));
      vi.mocked(getLpFills).mockResolvedValue([]);

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
          boostFees: new BigNumber('5000.00'),
        })
        .mockResolvedValueOnce({
          flipBurned: new BigNumber('1000.00').times(7),
          lpFees: new BigNumber('2000.00').times(7),
          networkFees: new BigNumber('3000.00').times(7),
          swapVolume: new BigNumber('4000.00').times(7),
          boostFees: new BigNumber('5000.00'),
        })
        .mockRejectedValue(Error('unexpected call'));

      vi.mocked(getLpFills)
        .mockResolvedValueOnce([
          {
            idSs58: 'cf1234567890',
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '50.00',
            alias: undefined,
          },
          {
            idSs58: 'cf0987654321',
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '50.00',
            alias: undefined,
          },
        ])
        .mockResolvedValueOnce([
          {
            idSs58: 'cf1234567890',
            alias: 'ChainflipGod',
            filledAmountValueUsd: new BigNumber('2000.00'),
            percentage: '49.00',
          },
          {
            idSs58: 'cf0987654321',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('2000.00'),
            percentage: '49.00',
          },
          {
            idSs58: 'cfxxxxxxxxxxx',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('10.00'),
            percentage: '1.00',
          },
        ])
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
      expect(vi.mocked(getLpFills).mock.calls).toMatchInlineSnapshot(`
        [
          [
            {
              "end": "2024-10-27T23:59:59.999Z",
              "start": "2024-10-27T00:00:00.000Z",
            },
          ],
          [
            {
              "end": "2024-10-27T23:59:59.999Z",
              "start": "2024-10-21T00:00:00.000Z",
            },
          ],
        ]
      `);
    });

    it('skips stale jobs', async () => {
      vi.setSystemTime(new Date('2024-10-29T12:34:56Z'));
      vi.mocked(getSwapVolumeStats).mockRejectedValue(Error('unexpected call'));

      const dispatchJobs = vi.fn();

      const endOfPeriod = endOfDay(new Date('2024-10-25T12:34:56Z'), { in: utc });

      await expect(
        config.processJob(dispatchJobs)({
          data: { endOfPeriod: endOfPeriod.valueOf(), sendWeeklySummary: false },
        } as Job<JobData['timePeriodStats'], any, any>),
      ).rejects.toThrowError('job is stale');

      expect(dispatchJobs).not.toHaveBeenCalled();
      expect(getSwapVolumeStats).not.toHaveBeenCalled();
    });
  });
});
