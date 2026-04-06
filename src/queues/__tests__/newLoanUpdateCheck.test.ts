import { subHours } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { lpClient } from '../../server.js';
import { config } from '../newLoanUpdateCheck.js';

const mockGetNewLoanUpdateResponse = (id: number, timestamp?: string) => ({
  updates: {
    nodes: [
      {
        id,
        type: 'BORROWING',
        amount: '40154262217635410',
        amountValueUsd: '128.2652526243',
        timestamp: timestamp ?? subHours(new Date(), 1).toISOString(),
        loanByLoanId: {
          id: '3',
          asset: 'Eth',
          accountByBorrowerId: {
            idSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
          },
        },
      },
    ],
  },
});

const mockGetNewLoanUpdateEmptyResponse = () => ({
  updates: {
    nodes: [],
  },
});

describe('newLoanUpdateCheck', () => {
  describe('processJob', () => {
    it('enqueues the next job with the latest id', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(mockGetNewLoanUpdateResponse(11));

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastCheckedLoanUpdateId: 10 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLoanUpdateId": 11,
                    },
                    "name": "newLoanUpdateCheck",
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
                    "id": "newLoanUpdateCheck",
                  },
                  "delay": 30000,
                },
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_BORROW",
                  },
                  "message": "🏦 Loan <strong><a href="https://scan.chainflip.io/loans/3">#3</a></strong>
        👤 Account: <strong><a href="https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7">cFLRQDfE…D2ENbqj7</a></strong>
        💳 Type: <strong>Borrow</strong>
        📥 Amount: <strong>0.040154 ETH on Ethereum</strong> ($128.27)",
                  "platform": "telegram",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_BORROW",
                  },
                  "message": "🏦 Loan **[#3](https://scan.chainflip.io/loans/3)**
        👤 Account: **[cFLRQDfE…D2ENbqj7](https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7)**
        💳 Type: **Borrow**
        📥 Amount: **0.040154 ETH on Ethereum** ($128.27)",
                  "platform": "discord",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_BORROW",
                  },
                  "message": "🏦 Loan https://scan.chainflip.io/loans/3
        👤 Account: https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7
        💳 Type: Borrow
        📥 Amount: 0.040154 ETH on Ethereum ($128.27)
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

    it('enqueues the next job with the same id', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(mockGetNewLoanUpdateEmptyResponse());

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastCheckedLoanUpdateId: 1 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLoanUpdateId": 1,
                    },
                    "name": "newLoanUpdateCheck",
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
                    "id": "newLoanUpdateCheck",
                  },
                  "delay": 30000,
                },
              },
            ],
          ],
        ]
      `);
    });

    it('skip sending out messages if the loan update is older than 12 hours', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLoanUpdateResponse(11, subHours(new Date(), 15).toISOString()),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastCheckedLoanUpdateId: 10 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLoanUpdateId": 11,
                    },
                    "name": "newLoanUpdateCheck",
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
                    "id": "newLoanUpdateCheck",
                  },
                  "delay": 30000,
                },
              },
            ],
          ],
        ]
      `);
    });
  });
});
