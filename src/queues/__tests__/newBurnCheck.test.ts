import { describe, it, expect, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import { config } from '../newBurnCheck.js';

const mockGetNewBurnResponse = (id: number) => ({
  burns: {
    nodes: [
      {
        amount: '12345678901234567890123',
        event: {
          block: {
            timestamp: '2024-10-31T15:15:00.000Z',
          },
          blockId: 1,
          indexInBlock: 1,
        },
        id,
        valueUsd: '4.21',
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
                "data": {
                  "channel": "telegram",
                  "message": "🔥 Burned 12345.68 FLIP ($4.21)! // <a href="https://scan.chainflip.io/events/1-1">view block on explorer</a>",
                  "messageType": "NEW_BURN",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "channel": "discord",
                  "message": "🔥 Burned 12345.68 FLIP ($4.21)! // [view block on explorer](https://scan.chainflip.io/events/1-1)",
                  "messageType": "NEW_BURN",
                },
                "name": "messageRouter",
              },
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
  });
});
