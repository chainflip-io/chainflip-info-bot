import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config } from '../newDelegationAcitivityCheck.js';

describe('newDelegationActivityCheck', () => {
  describe(config.processJob, () => {
    beforeEach(() => {
      // tell vitest we use mocked time
      vi.useFakeTimers();
    });

    afterEach(() => {
      // restoring date after each test run
      vi.useRealTimers();
    });

    it('enqueues the next job with the same id', async () => {
      vi.setSystemTime(new Date('2025-10-03T10:28:18+00:00'));
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
      vi.setSystemTime(new Date('2025-10-03T10:28:18+00:00'));
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
              {
                "data": {
                  "filterData": {
                    "name": "DELEGATION_EVENT",
                  },
                  "message": "Delegated to new operator
        🤴 Delegator: <a href="https://etherscan.io/tx//addresses/0xe7af9b1ad014a214d908dabca7d597d4f344af30">0xe7…af30</a>
        👷‍♂️ Operator: <a href="https://scan.chainflip.io/operators/cFMKGuLCxBtM9qsTwg9j4JkYc5dw7whs89kGxcwY2hSxX3wPn">Ninja 🥷 Staking</a>
        💰 Amount: <strong>29,387.464852 FLIP</strong> ($19,196.17)
        🧾 Transaction: <a href="https://etherscan.io/tx/0xc8a949e7534fbe13afde8816b0947884fd795db7bc1968cd0929b0ebf3ced935">0xc8a949…f3ced935</a>",
                  "opts": {
                    "disablePreview": true,
                  },
                  "platform": "telegram",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "DELEGATION_EVENT",
                  },
                  "message": "Delegated to new operator
        🤴 Delegator: [0xe7…af30](https://etherscan.io/tx//addresses/0xe7af9b1ad014a214d908dabca7d597d4f344af30)
        👷‍♂️ Operator: [Ninja Staking](https://scan.chainflip.io/operators/cFMKGuLCxBtM9qsTwg9j4JkYc5dw7whs89kGxcwY2hSxX3wPn)
        💰 Amount: **29,387.464852 FLIP** ($19,196.17)
        🧾 Transaction: [0xc8a949…f3ced935](https://etherscan.io/tx/0xc8a949e7534fbe13afde8816b0947884fd795db7bc1968cd0929b0ebf3ced935)",
                  "opts": {
                    "disablePreview": true,
                  },
                  "platform": "discord",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "DELEGATION_EVENT",
                  },
                  "message": "Delegated to new operator
        🤴 Delegator: 0xe7…af30
        👷‍♂️ Operator: Ninja 🥷 Staking
        💰 Amount: 29,387.464852 FLIP ($19,196.17)
        🧾 Transaction: https://etherscan.io/tx/0xc8a949e7534fbe13afde8816b0947884fd795db7bc1968cd0929b0ebf3ced935",
                  "opts": {
                    "disablePreview": true,
                  },
                  "platform": "twitter",
                },
                "name": "messageRouter",
              },
            ],
          ],
        ]
      `);
    });
  });
});
