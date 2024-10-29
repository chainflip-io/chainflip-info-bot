import { describe, it, expect, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import { config } from '../newSwapCheck.js';

const mockLatestSwapRequestResponse = (ids: string[]) => ({
  swapRequests: {
    nodes: ids.map((nativeId) => ({ nativeId })),
  },
});

describe('newSwapCheck', () => {
  describe('initialize', () => {
    it('queues the job', async () => {
      vi.mocked(explorerClient.request).mockResolvedValue(mockLatestSwapRequestResponse(['1']));

      const queue = { add: vi.fn() };

      await config.initialize?.(queue as any);

      expect(queue.add.mock.calls).toMatchInlineSnapshot(`
        [
          [
            "newSwapCheck",
            {
              "lastSwapRequestId": "1",
            },
            {
              "deduplication": {
                "id": "newSwapCheck",
              },
              "delay": 30000,
            },
          ],
        ]
      `);
    });
  });

  describe('processJob', () => {
    it('enqueues the next job with the same id', async () => {
      vi.mocked(explorerClient.request)
        .mockResolvedValue(mockLatestSwapRequestResponse(['1']))
        .mockResolvedValue(mockLatestSwapRequestResponse([]));

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastSwapRequestId: '1' } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastSwapRequestId": "1",
                    },
                    "name": "newSwapCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newSwapCheck",
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

    it('enqueues the next job with the latest id', async () => {
      vi.mocked(explorerClient.request)
        .mockResolvedValue(mockLatestSwapRequestResponse(['1']))
        .mockResolvedValue(mockLatestSwapRequestResponse(['9', '3', '2', '4', '5', '7']));

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({ data: { lastSwapRequestId: '1' } } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "lastSwapRequestId": "9",
                    },
                    "name": "newSwapCheck",
                    "opts": {
                      "deduplication": {
                        "id": "newSwapCheck",
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
