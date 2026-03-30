import { hoursToMilliseconds, subDays, subHours } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lpClient } from '../../server.js';
import { DispatchJobArgs } from '../initialize.js';
import { config } from '../liquidationStatusCheck.js';

const mockGetLiquidationStatusResponse = (isCompleted: boolean = false) => ({
  requests: {
    nodes: [
      {
        swapRequestId: '1',
        completedAtEventId: isCompleted ? '1' : null,
        abortedAtEventId: null,
        loanByLoanId: { id: '1' },
      },
      {
        swapRequestId: '2',
        completedAtEventId: isCompleted ? '2' : null,
        abortedAtEventId: null,
        loanByLoanId: { id: '2' },
      },
    ],
  },
});

describe('liquidationStatusCheck', () => {
  describe('processJob', () => {
    beforeEach(() => {
      // tell vitest we use mocked time
      vi.useFakeTimers();
    });

    afterEach(() => {
      // restoring date after each test run
      vi.useRealTimers();
    });

    it('enqueues the next job with the same id when liquidation has not finished', async () => {
      const now = new Date('2026-03-25T12:42:30+00:00').getTime();
      vi.setSystemTime(now);

      vi.mocked(lpClient.request).mockResolvedValueOnce(mockGetLiquidationStatusResponse());

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: {
          loanIds: ['1', '2'],
          swapRequestIds: ['1', '2'],
          createdAtEventId: '1',
          borrowerIdSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
          createdAt: subHours(now, 1).getTime(),
        },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "borrowerIdSs58": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
                      "createdAt": 1774438950000,
                      "createdAtEventId": "1",
                      "loanIds": [
                        "1",
                        "2",
                      ],
                      "swapRequestIds": [
                        "1",
                        "2",
                      ],
                    },
                    "name": "liquidationStatusCheck",
                  },
                ],
                "name": "scheduler",
                "opts": {
                  "deduplication": {
                    "id": "liquidation-status-1-1-2",
                  },
                  "delay": 30000,
                },
              },
            ],
          ],
        ]
      `);
    });

    it('changes delay interval when liquidation is in process and exceeds threshold interval', async () => {
      const now = new Date('2026-03-25T12:42:30+00:00').getTime();
      vi.setSystemTime(now);

      vi.mocked(lpClient.request).mockResolvedValueOnce(mockGetLiquidationStatusResponse());

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: {
          loanIds: ['1', '2'],
          swapRequestIds: ['1', '2'],
          createdAtEventId: '1',
          borrowerIdSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
          createdAt: subHours(now, 7).getTime(),
        },
      } as any);

      const job = dispatchJobs.mock.calls[0][0] as DispatchJobArgs[];
      expect(job[0]).toMatchObject({
        opts: {
          delay: hoursToMilliseconds(1),
        },
      });
    });

    it('skips job when liquidation exceeds max lifetime', async () => {
      const now = new Date('2026-03-25T12:42:30+00:00').getTime();
      vi.setSystemTime(now);

      vi.mocked(lpClient.request).mockResolvedValueOnce(mockGetLiquidationStatusResponse());

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: {
          loanIds: ['1', '2'],
          swapRequestIds: ['1', '2'],
          createdAtEventId: '1',
          borrowerIdSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
          createdAt: subDays(now, 8).getTime(),
        },
      } as any);

      expect(dispatchJobs).not.toHaveBeenCalled();
    });

    it('send messages when liquidation is completed', async () => {
      const now = new Date('2026-03-25T12:42:30+00:00').getTime();
      vi.setSystemTime(now);

      vi.mocked(lpClient.request).mockResolvedValueOnce(mockGetLiquidationStatusResponse(true));

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: {
          loanIds: ['1', '2'],
          swapRequestIds: ['1', '2'],
          createdAtEventId: '1',
          borrowerIdSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
          createdAt: new Date(),
        },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": {
                  "filterData": {
                    "name": "LIQUIDATION_COMPLETED",
                  },
                  "message": "Liquidation completed
        👤 Account: <strong><a href="https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7">cFLRQDfE…D2ENbqj7</a></strong>
        🏦 Loans: <strong><a href="https://scan.chainflip.io/loans/1">#1</a>, </strong><strong><a href="https://scan.chainflip.io/loans/2">#2</a></strong>
        🔄 Liquidation swaps: <strong><a href="https://scan.chainflip.io/swaps/1">#1</a>, </strong><strong><a href="https://scan.chainflip.io/swaps/2">#2</a></strong>",
                  "platform": "telegram",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "LIQUIDATION_COMPLETED",
                  },
                  "message": "Liquidation completed
        👤 Account: **[cFLRQDfE…D2ENbqj7](https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7)**
        🏦 Loans: **[#1](https://scan.chainflip.io/loans/1), ****[#2](https://scan.chainflip.io/loans/2)**
        🔄 Liquidation swaps: **[#1](https://scan.chainflip.io/swaps/1), ****[#2](https://scan.chainflip.io/swaps/2)**",
                  "platform": "discord",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "LIQUIDATION_COMPLETED",
                  },
                  "message": "Liquidation completed
        👤 Account: https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7
        🏦 Loans: https://scan.chainflip.io/loans/1, https://scan.chainflip.io/loans/2
        🔄 Liquidation swaps: https://scan.chainflip.io/swaps/1, https://scan.chainflip.io/swaps/2
        #chainflip $flip",
                  "platform": "twitter",
                },
                "name": "messageRouter",
              },
            ],
          ],
        ]
      `);
    });
  });
});
