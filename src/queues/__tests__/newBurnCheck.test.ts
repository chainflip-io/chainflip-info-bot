import { subHours } from 'date-fns';
import { describe, it, expect, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import { config } from '../newBurnCheck.js';

const mockGetNewBurnResponse = (id: number, timestamp?: string, usdValue?: string | null) => ({
  burns: {
    nodes: [
      {
        amount: '12345678901234567890123',
        event: {
          block: {
            timestamp: timestamp ?? subHours(new Date(), 1).toISOString(),
          },
          blockId: 1,
          indexInBlock: 1,
        },
        id,
        valueUsd: usdValue === undefined ? '4.21' : usdValue,
      },
    ],
  },
});

const mockGetNewBurnEmptyResponse = () => ({
  burns: {
    nodes: [],
  },
});

describe('newBurnCheck', () => {
  describe('initialize', () => {
    it('queues the job', async () => {
      vi.mocked(explorerClient.request).mockResolvedValue(mockGetNewBurnResponse(11));

      const queue = { add: vi.fn() };

      await config.initialize?.(queue as any);

      expect(queue.add.mock.calls).toMatchInlineSnapshot(`
        [
          [
            "newBurnCheck",
            {
              "lastBurnId": 11,
            },
            {
              "deduplication": {
                "id": "newBurnCheck",
              },
              "delay": 30000,
            },
          ],
        ]
      `);
    });
  });

  describe('processJob', () => {
    it('enqueues the next job with the latest id', async () => {
      vi.mocked(explorerClient.request).mockResolvedValueOnce(mockGetNewBurnResponse(11));

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastBurnId: 10 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastBurnId": 11,
                    },
                    "name": "newBurnCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newBurnCheck",
                      },
                      "delay": 30000,
                    },
                  },
                ],
                "name": "scheduler",
              },
              {
                "data": {
                  "message": "🔥 Burned 12345.68 FLIP ($4.21)!
        <a href="https://scan.chainflip.io/events/1-1">View on explorer</a>",
                  "platform": "telegram",
                  "validationData": {
                    "name": "NEW_BURN",
                  },
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "message": "🔥 Burned 12345.68 FLIP ($4.21)!
        [View on explorer](https://scan.chainflip.io/events/1-1)",
                  "platform": "discord",
                  "validationData": {
                    "name": "NEW_BURN",
                  },
                },
                "name": "messageRouter",
              },
            ],
          ],
        ]
      `);
    });

    it('handles missing USD values', async () => {
      vi.mocked(explorerClient.request).mockResolvedValueOnce(
        mockGetNewBurnResponse(11, undefined, null),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastBurnId: 10 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastBurnId": 11,
                    },
                    "name": "newBurnCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newBurnCheck",
                      },
                      "delay": 30000,
                    },
                  },
                ],
                "name": "scheduler",
              },
              {
                "data": {
                  "message": "🔥 Burned 12345.68 FLIP!
        <a href="https://scan.chainflip.io/events/1-1">View on explorer</a>",
                  "platform": "telegram",
                  "validationData": {
                    "name": "NEW_BURN",
                  },
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "message": "🔥 Burned 12345.68 FLIP!
        [View on explorer](https://scan.chainflip.io/events/1-1)",
                  "platform": "discord",
                  "validationData": {
                    "name": "NEW_BURN",
                  },
                },
                "name": "messageRouter",
              },
            ],
          ],
        ]
      `);
    });

    it('enqueues the next job with the same id', async () => {
      vi.mocked(explorerClient.request).mockResolvedValue(mockGetNewBurnEmptyResponse());

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastBurnId: 1 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastBurnId": 1,
                    },
                    "name": "newBurnCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newBurnCheck",
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

    it('skip sending out messages if the burn is older than 12 hours', async () => {
      vi.mocked(explorerClient.request).mockResolvedValueOnce(
        mockGetNewBurnResponse(11, subHours(new Date(), 15).toISOString()),
      );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastBurnId: 10 } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastBurnId": 11,
                    },
                    "name": "newBurnCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newBurnCheck",
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
