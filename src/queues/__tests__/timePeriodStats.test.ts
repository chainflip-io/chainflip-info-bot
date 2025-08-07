import { utc } from '@date-fns/utc';
import BigNumber from 'bignumber.js';
import { type Job } from 'bullmq';
import { endOfDay } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import getBoostSummary from '../../queries/boostSummary.js';
import getLpFills from '../../queries/lpFills.js';
import getSwapVolumeStats from '../../queries/swapVolume.js';
import { config, getNextJobData } from '../timePeriodStats.js';

vi.mock('../../queries/swapVolume.js');
vi.mock('../../queries/lpFills.js');
vi.mock('../../queries/boostSummary.js');

describe('time period stats', () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  describe(getNextJobData, () => {
    it('returns data for daily jobs', () => {
      vi.setSystemTime(new Date('2024-10-25T12:34:56Z'));

      expect(getNextJobData()).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "data": {
                "endOfPeriod": 1729900799999,
                "sendWeeklySummary": false,
              },
              "name": "timePeriodStats",
              "opts": {
                "attempts": 720,
                "backoff": {
                  "delay": 5000,
                  "type": "fixed",
                },
              },
            },
          ],
          "name": "scheduler",
          "opts": {
            "deduplication": {
              "id": "timePeriodStats-1729900799999",
            },
            "delay": 41103999,
          },
        }
      `);
    });

    it('returns data for weekly jobs', () => {
      vi.setSystemTime(new Date('2024-10-27T12:34:56Z'));

      expect(getNextJobData()).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "data": {
                "endOfPeriod": 1730073599999,
                "sendWeeklySummary": true,
              },
              "name": "timePeriodStats",
              "opts": {
                "attempts": 720,
                "backoff": {
                  "delay": 5000,
                  "type": "fixed",
                },
              },
            },
          ],
          "name": "scheduler",
          "opts": {
            "deduplication": {
              "id": "timePeriodStats-1730073599999",
            },
            "delay": 41103999,
          },
        }
      `);
    });
  });

  describe('processJob', () => {
    it('processes a daily job', async () => {
      vi.setSystemTime(new Date('2024-10-25T12:34:56Z'));
      vi.mocked(getSwapVolumeStats)
        .mockResolvedValueOnce({
          totalFlipBurned: new BigNumber('1000.00'),
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
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFKjURUE4jdxHgcKb4uBnKiY9Pkx2yuvQuRVfTDFh5j5eUgyN',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFMxkJ79ka5Bu8PTxwMm9E2U8bKR5fwaPuNQBErXoaYvFYwvB',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFMBE4zhwZ9PQ7xBupusy2mLerkSBhU9oAxoMiCpw3kKAR4Kz',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFLEFzKb4QCruqMn5xrCm2sPFt2taXWrvuSDTvuq6U3etkcPP',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFLGvPhhrribWCx9id5kLVqwiFK4QiVNjQ6ViyaRFF2Nrgq7j',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFLT2BLiSijog9mvFipfPapisweJ8MMMTQisCiNKAEsBQnn5t',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
          {
            idSs58: 'cFLT2BLiSijog9mvFipfPapisweJ8MMMTQisCiNKAEsBQnn5t',
            alias: undefined,
            filledAmountValueUsd: new BigNumber('1000.00'),
            percentage: '10.00',
            type: 'LIQUIDITY_PROVIDER',
          },
        ])
        .mockRejectedValue(Error('unexpected call'));

      vi.mocked(getBoostSummary)
        .mockResolvedValueOnce({
          boostedAmount: new BigNumber('17.62890095'),
          boostedAmountUsd: new BigNumber('1189844.1064157963'),
          earnedBoostFee: new BigNumber('0.00880322'),
          earnedBoostFeeUsd: new BigNumber('594.1637309781'),
          apys: [{ feeTiers: 5, currentApy: '21.35%' }],
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
      expect(vi.mocked(getBoostSummary).mock.calls).toMatchInlineSnapshot(`
        [
          [
            2024-10-25T00:00:00.000Z,
            2024-10-25T23:59:59.999Z,
            "Btc",
          ],
        ]
      `);
    });

    it('processes a daily job without a flip burn or boost fees', async () => {
      vi.setSystemTime(new Date('2024-10-25T12:34:56Z'));
      vi.mocked(getSwapVolumeStats)
        .mockResolvedValueOnce({
          totalFlipBurned: null,
          lpFees: new BigNumber('2000.00'),
          networkFees: new BigNumber('3000.00'),
          swapVolume: new BigNumber('4000.00'),
          boostFees: new BigNumber(0),
        })
        .mockRejectedValue(Error('unexpected call'));
      vi.mocked(getLpFills).mockResolvedValue([]);
      vi.mocked(getBoostSummary)
        .mockResolvedValueOnce({
          boostedAmount: new BigNumber('17.62890095'),
          boostedAmountUsd: new BigNumber('1189844.1064157963'),
          earnedBoostFee: new BigNumber('0.00880322'),
          earnedBoostFeeUsd: new BigNumber('594.1637309781'),
          apys: [{ feeTiers: 5, currentApy: '21.35%' }],
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
          totalFlipBurned: new BigNumber('1000.00'),
          lpFees: new BigNumber('2000.00'),
          networkFees: new BigNumber('3000.00'),
          swapVolume: new BigNumber('4000.00'),
          boostFees: new BigNumber('5000.00'),
        })
        .mockResolvedValueOnce({
          totalFlipBurned: new BigNumber('1000.00').times(7),
          lpFees: new BigNumber('2000.00').times(7),
          networkFees: new BigNumber('3000.00').times(7),
          swapVolume: new BigNumber('4000.00').times(7),
          boostFees: new BigNumber('5000.00'),
        })
        .mockRejectedValue(Error('unexpected call'));

      vi.mocked(getLpFills).mockResolvedValue([
        {
          idSs58: 'cFMboYsd4HvERKXX11LyvZXuTcQzV7KAe9ipP4La5vUs8fd4e',
          alias: 'ChainflipGod',
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFKjURUE4jdxHgcKb4uBnKiY9Pkx2yuvQuRVfTDFh5j5eUgyN',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFMxkJ79ka5Bu8PTxwMm9E2U8bKR5fwaPuNQBErXoaYvFYwvB',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFMBE4zhwZ9PQ7xBupusy2mLerkSBhU9oAxoMiCpw3kKAR4Kz',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFLEFzKb4QCruqMn5xrCm2sPFt2taXWrvuSDTvuq6U3etkcPP',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFLGvPhhrribWCx9id5kLVqwiFK4QiVNjQ6ViyaRFF2Nrgq7j',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFLT2BLiSijog9mvFipfPapisweJ8MMMTQisCiNKAEsBQnn5t',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
        {
          idSs58: 'cFLT2BLiSijog9mvFipfPapisweJ8MMMTQisCiNKAEsBQnn5t',
          alias: undefined,
          filledAmountValueUsd: new BigNumber('1000.00'),
          percentage: '10.00',
          type: 'LIQUIDITY_PROVIDER',
        },
      ]);

      vi.mocked(getBoostSummary)
        .mockResolvedValueOnce({
          boostedAmount: new BigNumber('17.62890095'),
          boostedAmountUsd: new BigNumber('1189844.1064157963'),
          earnedBoostFee: new BigNumber('0.00880322'),
          earnedBoostFeeUsd: new BigNumber('594.1637309781'),
          apys: [{ feeTiers: 5, currentApy: '21.35%' }],
        })
        .mockResolvedValueOnce({
          boostedAmount: new BigNumber('17.62890095').times(7),
          boostedAmountUsd: new BigNumber('1189844.1064157963').times(7),
          earnedBoostFee: new BigNumber('0.00880322').times(7),
          earnedBoostFeeUsd: new BigNumber('594.1637309781').times(7),
          apys: [{ feeTiers: 5, currentApy: '21.35%' }],
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
      expect(vi.mocked(getBoostSummary).mock.calls).toMatchInlineSnapshot(`
        [
          [
            2024-10-27T00:00:00.000Z,
            2024-10-27T23:59:59.999Z,
            "Btc",
          ],
          [
            2024-10-21T00:00:00.000Z,
            2024-10-27T23:59:59.999Z,
            "Btc",
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
