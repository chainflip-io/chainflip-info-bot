import { subHours } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { lpClient } from '../../server.js';
import { config } from '../newLendingLiquidityChangeCheck.js';

const mockGetNewLendingLiquidityChangeResponse = (
  id: number,
  timestamp?: string,
  isAccountByLiquidityProviderId: boolean = true,
) => ({
  liquidityChanges: {
    nodes: [
      {
        id,
        type: 'DEPOSIT',
        asset: 'Eth',
        amount: '40154262217635410',
        amountUsd: '128.2652526243',
        timestamp: timestamp ?? subHours(new Date(), 1).toISOString(),
        accountByLiquidityProviderId: isAccountByLiquidityProviderId
          ? {
              idSs58: 'cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7',
            }
          : null,
      },
    ],
  },
});

const mockGetNewLendingLiquidityChangeEmptyResponse = () => ({
  liquidityChanges: {
    nodes: [],
  },
});

describe('newLendingLiquidityChangeCheck', () => {
  describe('processJob', () => {
    it('enqueues the next job with the latest id', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLendingLiquidityChangeResponse(11),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLendingLiquidityChangeId: 10 },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLendingLiquidityChangeId": 11,
                    },
                    "name": "newLendingLiquidityChangeCheck",
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
                    "id": "newLendingLiquidityChangeCheck",
                  },
                  "delay": 30000,
                },
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_DEPOSIT",
                  },
                  "message": "🏦 Lending pool transaction
        👤 Account: <strong><a href="https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7">cFLRQDfE…D2ENbqj7</a></strong>
        💳 Type: <strong>Supply</strong>
        📥 Amount: <strong>0.040154 ETH on Ethereum</strong> ($128.27)",
                  "platform": "telegram",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_DEPOSIT",
                  },
                  "message": "🏦 Lending pool transaction
        👤 Account: **[cFLRQDfE…D2ENbqj7](https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7)**
        💳 Type: **Supply**
        📥 Amount: **0.040154 ETH on Ethereum** ($128.27)",
                  "platform": "discord",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_DEPOSIT",
                  },
                  "message": "🏦 Lending pool transaction
        👤 Account: https://scan.chainflip.io/lps/cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7
        💳 Type: Supply
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

    it('skips account line when accountByLiquidityProviderId is null', async () => {
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLendingLiquidityChangeResponse(11, undefined, false),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLendingLiquidityChangeId: 10 },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLendingLiquidityChangeId": 11,
                    },
                    "name": "newLendingLiquidityChangeCheck",
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
                    "id": "newLendingLiquidityChangeCheck",
                  },
                  "delay": 30000,
                },
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_DEPOSIT",
                  },
                  "message": "🏦 Lending pool transaction
        💳 Type: <strong>Supply</strong>
        📥 Amount: <strong>0.040154 ETH on Ethereum</strong> ($128.27)",
                  "platform": "telegram",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_DEPOSIT",
                  },
                  "message": "🏦 Lending pool transaction
        💳 Type: **Supply**
        📥 Amount: **0.040154 ETH on Ethereum** ($128.27)",
                  "platform": "discord",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_DEPOSIT",
                  },
                  "message": "🏦 Lending pool transaction
        💳 Type: Supply
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
      vi.mocked(lpClient.request).mockResolvedValueOnce(
        mockGetNewLendingLiquidityChangeEmptyResponse(),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLendingLiquidityChangeId: 1 },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLendingLiquidityChangeId": 1,
                    },
                    "name": "newLendingLiquidityChangeCheck",
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
                    "id": "newLendingLiquidityChangeCheck",
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
        mockGetNewLendingLiquidityChangeResponse(11, subHours(new Date(), 15).toISOString()),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastCheckedLendingLiquidityChangeId: 10 },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedLendingLiquidityChangeId": 11,
                    },
                    "name": "newLendingLiquidityChangeCheck",
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
                    "id": "newLendingLiquidityChangeCheck",
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
