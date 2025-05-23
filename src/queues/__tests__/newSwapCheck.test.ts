import { describe, it, expect, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import { config } from '../newSwapCheck.js';

const mockLatestSwapRequestResponse = (ids: string[]) => ({
  swapRequests: {
    nodes: ids.map((nativeId) => ({ nativeId })),
  },
});

describe('newSwapCheck', () => {
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
                    "id": "newSwapCheck",
                  },
                  "delay": 30000,
                },
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
                    "id": "newSwapCheck",
                  },
                  "delay": 30000,
                },
              },
              {
                "data": {
                  "swapRequestId": "9",
                },
                "name": "swapStatusCheck",
              },
              {
                "data": {
                  "swapRequestId": "9",
                },
                "name": "newSwapAlert",
              },
              {
                "data": {
                  "swapRequestId": "3",
                },
                "name": "swapStatusCheck",
              },
              {
                "data": {
                  "swapRequestId": "3",
                },
                "name": "newSwapAlert",
              },
              {
                "data": {
                  "swapRequestId": "2",
                },
                "name": "swapStatusCheck",
              },
              {
                "data": {
                  "swapRequestId": "2",
                },
                "name": "newSwapAlert",
              },
              {
                "data": {
                  "swapRequestId": "4",
                },
                "name": "swapStatusCheck",
              },
              {
                "data": {
                  "swapRequestId": "4",
                },
                "name": "newSwapAlert",
              },
              {
                "data": {
                  "swapRequestId": "5",
                },
                "name": "swapStatusCheck",
              },
              {
                "data": {
                  "swapRequestId": "5",
                },
                "name": "newSwapAlert",
              },
              {
                "data": {
                  "swapRequestId": "7",
                },
                "name": "swapStatusCheck",
              },
              {
                "data": {
                  "swapRequestId": "7",
                },
                "name": "newSwapAlert",
              },
            ],
          ],
        ]
      `);
    });
  });
});
