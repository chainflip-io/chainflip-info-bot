import { describe, it, expect, vi } from 'vitest';
import { config } from '../newDelegationAcitivityCheck.js';

describe('newDelegationActivityCheck', () => {
  describe(config.processJob, () => {
    it('enqueues the next job with the same id', async () => {
      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { delegationActivityId: 1000 },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "delegationActivityId": 1000,
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

    it('sends messages', async () => {
      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: { delegationActivityId: 0 },
      } as any);

      expect(dispatchJobs.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [
              {
                "data": [
                  {
                    "data": {
                      "delegationActivityId": 72,
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
  });
});
