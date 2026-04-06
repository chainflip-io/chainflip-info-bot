import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lpClient } from '../../server.js';
import { DispatchJobArgs } from '../initialize.js';
import { config } from '../newLiquidationCheck.js';

const mockGetNewLiquidationSwapRequestsEmptyResponse = () => ({
  requests: {
    nodes: [],
  },
});

const mockGetBoundaryLiquidationSwapRequestResponse = (swapRequestId: string) => ({
  requests: {
    nodes: [
      {
        swapRequestId,
      },
    ],
  },
});

const mockGetNewLiquidationSwapRequestsResponse = (
  isSingleAccount = false,
  hasSeveralLiquidations = false,
) => ({
  requests: {
    nodes: [
      {
        id: '2',
        swapRequestId: '2',
        createdAtEventId: '1',
        loanByLoanId: {
          id: '1',
          asset: 'Eth',
          accountByBorrowerId: {
            idSs58: isSingleAccount
              ? 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7'
              : 'cFMboYsd4HvERKXX11LyvZXuTcQzV7KAe9ipP4La5vUs8fd4e',
          },
        },
      },
      {
        id: '3',
        swapRequestId: '3',
        createdAtEventId: '1',
        loanByLoanId: {
          id: '2',
          asset: 'Usdt',
          accountByBorrowerId: {
            idSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
          },
        },
      },
      {
        id: '4',
        swapRequestId: '4',
        createdAtEventId: '1',
        loanByLoanId: {
          id: '2',
          asset: 'Usdt',
          accountByBorrowerId: {
            idSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
          },
        },
      },
      ...(hasSeveralLiquidations
        ? [
            {
              id: '5',
              swapRequestId: '5',
              createdAtEventId: '2',
              loanByLoanId: {
                id: '1',
                asset: 'Eth',
                accountByBorrowerId: {
                  idSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
                },
              },
            },
            {
              id: '6',
              swapRequestId: '6',
              createdAtEventId: '2',
              loanByLoanId: {
                id: '2',
                asset: 'Usdt',
                accountByBorrowerId: {
                  idSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
                },
              },
            },
          ]
        : []),
    ],
  },
});

describe('newLiquidationCheck', () => {
  describe('processJob', () => {
    beforeEach(() => {
      // tell vitest we use mocked time
      vi.useFakeTimers();
    });

    afterEach(() => {
      // restoring date after each test run
      vi.useRealTimers();
    });

    it('enqueues the next job with the same id when there are no new liquidation swap requests', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLiquidationSwapRequestsEmptyResponse(),
      );
      vi.mocked(lpClient.request).mockResolvedValueOnce([]);

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLiquidationSwapRequestId: '1' },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLiquidationSwapRequestId": "1",
                    },
                    "name": "newLiquidationCheck",
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
                    "id": "newLiquidationCheck",
                  },
                  "delay": 30000,
                },
              },
            ],
          ],
        ]
      `);
    });

    it('enqueues the next job with the same id when there are no new liquidation swap requests and boundary id is behind', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLiquidationSwapRequestsEmptyResponse(),
      );
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetBoundaryLiquidationSwapRequestResponse('5'),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLiquidationSwapRequestId: '10' },
      } as any);

      const jobs = dispatchJobs.mock.calls[0][0] as DispatchJobArgs[];
      expect(jobs[0]).toMatchObject({
        data: [
          {
            data: {
              lastCheckedLiquidationSwapRequestId: '10',
            },
          },
        ],
      });
    });

    it('enqueues the next job with boundary id when there are no new liquidation swap requests and last checked id is stale', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLiquidationSwapRequestsEmptyResponse(),
      );
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetBoundaryLiquidationSwapRequestResponse('10'),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLiquidationSwapRequestId: '1' },
      } as any);

      const jobs = dispatchJobs.mock.calls[0][0] as DispatchJobArgs[];
      expect(jobs[0]).toMatchObject({
        data: [
          {
            data: {
              lastCheckedLiquidationSwapRequestId: '10',
            },
          },
        ],
      });
    });

    it('enqueues the next job with the latest id, dispatches messages and status check for single account', async () => {
      vi.setSystemTime(new Date('2026-03-25T12:42:30+00:00'));

      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLiquidationSwapRequestsResponse(true),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLiquidationSwapRequestId: '1' },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLiquidationSwapRequestId": "4",
                    },
                    "name": "newLiquidationCheck",
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
                    "id": "newLiquidationCheck",
                  },
                  "delay": 30000,
                },
              },
              {
                "data": {
                  "filterData": {
                    "name": "LIQUIDATION_INITIATED",
                  },
                  "message": "👀 Liquidation initiated
        👤 Account: <strong><a href="https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7">cFLRQDfE…D2ENbqj7</a></strong>
        🏦 Loans: <strong><a href="https://scan.chainflip.io/loans/1">#1</a>, <a href="https://scan.chainflip.io/loans/2">#2</a></strong>
        🔄 Liquidation swaps: <strong><a href="https://scan.chainflip.io/swaps/2">#2</a>, <a href="https://scan.chainflip.io/swaps/3">#3</a>, <a href="https://scan.chainflip.io/swaps/4">#4</a></strong>",
                  "platform": "telegram",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "LIQUIDATION_INITIATED",
                  },
                  "message": "👀 Liquidation initiated
        👤 Account: **[cFLRQDfE…D2ENbqj7](https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7)**
        🏦 Loans: **[#1](https://scan.chainflip.io/loans/1), [#2](https://scan.chainflip.io/loans/2)**
        🔄 Liquidation swaps: **[#2](https://scan.chainflip.io/swaps/2), [#3](https://scan.chainflip.io/swaps/3), [#4](https://scan.chainflip.io/swaps/4)**",
                  "platform": "discord",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "LIQUIDATION_INITIATED",
                  },
                  "message": "👀 Liquidation initiated
        👤 Account: https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7
        🏦 Loans: https://scan.chainflip.io/loans/1, https://scan.chainflip.io/loans/2
        🔄 Liquidation swaps: https://scan.chainflip.io/swaps/2, https://scan.chainflip.io/swaps/3, https://scan.chainflip.io/swaps/4
        #chainflip $flip",
                  "platform": "twitter",
                },
                "name": "messageRouter",
              },
              {
                "data": [
                  {
                    "data": {
                      "borrowerIdSs58": "cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7",
                      "deduplicationId": "liquidation-status-cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7-1",
                      "jobCreatedAt": 1774442550000,
                      "loanIds": [
                        "1",
                        "2",
                      ],
                      "swapRequestIds": [
                        "2",
                        "3",
                        "4",
                      ],
                    },
                    "name": "liquidationStatusCheck",
                  },
                ],
                "name": "scheduler",
                "opts": {
                  "deduplication": {
                    "id": "liquidation-status-cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7-1",
                  },
                  "delay": 30000,
                },
              },
            ],
          ],
        ]
      `);
    });

    it('enqueues the next job with the latest id, dispatches separate messages and status check for multiple accounts', async () => {
      vi.setSystemTime(new Date('2026-03-25T12:42:30+00:00'));

      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLiquidationSwapRequestsResponse(),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLiquidationSwapRequestId: '1' },
      } as any);

      const jobs = dispatchJobs.mock.calls[0][0] as DispatchJobArgs[];

      // scheduler + (3 messages and status check) per account = 9
      expect(jobs).toHaveLength(9);

      expect(jobs[4]).toMatchObject({
        data: [
          {
            data: {
              borrowerIdSs58: 'cFMboYsd4HvERKXX11LyvZXuTcQzV7KAe9ipP4La5vUs8fd4e',
              jobCreatedAt: new Date('2026-03-25T12:42:30+00:00').getTime(),
              loanIds: ['1'],
              swapRequestIds: ['2'],
              deduplicationId:
                'liquidation-status-cFMboYsd4HvERKXX11LyvZXuTcQzV7KAe9ipP4La5vUs8fd4e-1',
            },
            name: 'liquidationStatusCheck',
          },
        ],
        name: 'scheduler',
      });

      expect(jobs[8]).toMatchObject({
        data: [
          {
            data: {
              borrowerIdSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
              jobCreatedAt: new Date('2026-03-25T12:42:30+00:00').getTime(),
              loanIds: ['2'],
              swapRequestIds: ['3', '4'],
              deduplicationId:
                'liquidation-status-cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7-1',
            },
            name: 'liquidationStatusCheck',
          },
        ],
        name: 'scheduler',
      });
    });

    it('send separate messages if several liquidation processes were detected per account', async () => {
      vi.setSystemTime(new Date('2026-03-25T12:42:30+00:00'));

      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLiquidationSwapRequestsResponse(true, true),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLiquidationSwapRequestId: '1' },
      } as any);

      const jobs = dispatchJobs.mock.calls[0][0] as DispatchJobArgs[];

      // scheduler + (3 messages and status check) per liquidation = 9
      expect(jobs).toHaveLength(9);
    });
  });
});
