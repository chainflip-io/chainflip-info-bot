import { subHours } from 'date-fns/subHours';
import { describe, it, expect, vi, afterEach } from 'vitest';
import checkForFirstNewLpDeposits, { getLatestDepositId } from '../../queries/liquidityDeposits.js';
import { config } from '../newLpDepositCheck.js';

vi.mock('../../queries/liquidityDeposits.js');

describe('newLpDepositCheck', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('initialize', () => {
    it('queues the job', async () => {
      vi.mocked(getLatestDepositId).mockResolvedValueOnce(1);
      const queue = { add: vi.fn() };

      await config.initialize?.(queue as any);

      expect(queue.add.mock.calls).toMatchInlineSnapshot(`
        [
          [
            "newLpDepositCheck",
            {
              "lastCheckedDepositId": 1,
            },
            {
              "deduplication": {
                "id": "newLpDepositCheck",
              },
              "delay": 30000,
            },
          ],
        ]
      `);
    });
  });

  describe('processJob', () => {
    it('processes a job', async () => {
      vi.mocked(getLatestDepositId).mockResolvedValueOnce(10);
      vi.mocked(checkForFirstNewLpDeposits).mockResolvedValueOnce([
        {
          asset: 'Eth',
          depositAmount: '1.523',
          depositValueUsd: '999',
          lpIdSs58: 'cf123test',
          timestamp: new Date().toISOString(),
        },
      ]);

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastSwapRequestId: 10 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedDepositId": 10,
                    },
                    "name": "newLpDepositCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newLpDepositCheck",
                      },
                      "delay": 30000,
                    },
                  },
                ],
                "name": "scheduler",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_LP",
                  },
                  "message": "💸 New Liquidity Provider Detected!
        <strong>cf12…test</strong> deposited 1.523 ETH on Ethereum ($999.00) 🍾
        <a href="https://scan.chainflip.io/lps/cf123test">View on explorer</a>",
                  "platform": "telegram",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_LP",
                  },
                  "message": "💸 New Liquidity Provider Detected!
        **cf12…test** deposited 1.523 ETH on Ethereum ($999.00) 🍾
        [View on explorer](https://scan.chainflip.io/lps/cf123test)",
                  "platform": "discord",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "NEW_LP",
                  },
                  "message": "💸 New Liquidity Provider Detected!
        cf12…test deposited 1.523 ETH on Ethereum ($999.00) 🍾
        https://scan.chainflip.io/lps/cf123test
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

    it('skips scheduling the message if the deposit is older than 12 hours', async () => {
      vi.mocked(getLatestDepositId).mockResolvedValueOnce(10);
      vi.mocked(checkForFirstNewLpDeposits).mockResolvedValueOnce([
        {
          asset: 'Eth',
          depositAmount: '1.523',
          depositValueUsd: '999',
          lpIdSs58: 'cf123test',
          timestamp: subHours(new Date(), 15).toISOString(),
        },
      ]);

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastSwapRequestId: 10 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastCheckedDepositId": 10,
                    },
                    "name": "newLpDepositCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newLpDepositCheck",
                      },
                      "delay": 30000,
                    },
                  },
                ],
                "name": "scheduler",
              },
            ],
          ],
        ]
      `);
    });
  });
});
