import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../scheduler.js';

describe('scheduler', () => {
  describe(config.processJob, () => {
    it('forwards the job data to the dispatchJobs function', async () => {
      const dispatchJobs = vi.fn();

      await config.processJob(dispatchJobs)({
        data: [
          {
            name: 'scheduler',
            data: [],
          },
          {
            name: 'sendMessage',
            data: {
              key: 'telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8',
              message: 'Hello, world!',
            },
          },
        ] as JobData['scheduler'],
      } as any);

      expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
        [
          [
            {
              "data": {
                "key": "telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8",
                "message": "Hello, world!",
              },
              "name": "sendMessage",
            },
          ],
        ]
      `);
    });
  });

  describe(config.initialize!, () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('initializes the queue with periodic jobs', async () => {
      vi.setSystemTime(new Date('2024-11-14T10:00:00Z'));
      const addBulk = vi.fn();
      await config.initialize!({ addBulk } as any);
      expect(addBulk).toHaveBeenCalledTimes(1);
      expect(addBulk.mock.lastCall).toMatchInlineSnapshot(`
        [
          [
            {
              "data": [
                {
                  "data": {
                    "endOfPeriod": 1731628799999,
                    "sendWeeklySummary": false,
                  },
                  "name": "timePeriodStats",
                },
              ],
              "name": "scheduler",
              "opts": {
                "deduplication": {
                  "id": "timePeriodStats-1731628799999",
                },
                "delay": 50399999,
              },
            },
            {
              "data": [
                {
                  "data": {
                    "lastSwapRequestId": "115482",
                  },
                  "name": "newSwapCheck",
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
              "data": [
                {
                  "data": {
                    "lastCheckedDepositId": 1834,
                  },
                  "name": "newLpDepositCheck",
                },
              ],
              "name": "scheduler",
              "opts": {
                "deduplication": {
                  "id": "newLpDepositCheck",
                },
                "delay": 30000,
              },
            },
            {
              "data": [
                {
                  "data": {
                    "lastBurnId": 230,
                  },
                  "name": "newBurnCheck",
                },
              ],
              "name": "scheduler",
              "opts": {
                "deduplication": {
                  "id": "newBurnCheck",
                },
                "delay": 30000,
              },
            },
          ],
        ]
      `);
    });
  });
});
