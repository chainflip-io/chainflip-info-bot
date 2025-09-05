import { describe, it, expect, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import { config } from '../newDelegationAcitivityCheck.js';

const mockLatestDelegationActivityRequestResponse = (ids: string[]) => ({
  delegationActivities: {
    nodes: ids.map((id) => ({ id })),
  },
});

describe('newDelegationActivityCheck', () => {
  describe('processJob', () => {
    it('enqueues the next job with the same id', async () => {
      vi.mocked(explorerClient.request)
        .mockResolvedValue(mockLatestDelegationActivityRequestResponse(['1']))
        .mockResolvedValue(mockLatestDelegationActivityRequestResponse([]));

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastDelegationActivityRequestId: '1' },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "delegationActivityId": NaN,
                    },
                    "name": "newDelegationActivityCheck",
                  },
                ],
                "name": "scheduler",
                "opts": {
                  "deduplication": {
                    "id": "newDelegationActivityCheck",
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
        .mockResolvedValue(mockLatestDelegationActivityRequestResponse(['1']))
        .mockResolvedValue(
          mockLatestDelegationActivityRequestResponse(['9', '3', '2', '4', '5', '7']),
        );

      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { lastDelegationActivityRequestId: '1' },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "delegationActivityId": 9,
                    },
                    "name": "newDelegationActivityCheck",
                  },
                ],
                "name": "scheduler",
                "opts": {
                  "deduplication": {
                    "id": "newDelegationActivityCheck",
                  },
                  "delay": 30000,
                },
              },
              {
                "data": {
                  "delegationActivityId": "9",
                },
                "name": "delegationActivityStatusCheck",
              },
              {
                "data": {
                  "delegationActivityId": "3",
                },
                "name": "delegationActivityStatusCheck",
              },
              {
                "data": {
                  "delegationActivityId": "2",
                },
                "name": "delegationActivityStatusCheck",
              },
              {
                "data": {
                  "delegationActivityId": "4",
                },
                "name": "delegationActivityStatusCheck",
              },
              {
                "data": {
                  "delegationActivityId": "5",
                },
                "name": "delegationActivityStatusCheck",
              },
              {
                "data": {
                  "delegationActivityId": "7",
                },
                "name": "delegationActivityStatusCheck",
              },
            ],
          ],
        ]
      `);
    });
  });
});
