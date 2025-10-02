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
                      "delegationActivityId": 1,
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
        🤴 Delegator: <a href="https://etherscan.io/tx//addresses/0x2412487875b155d901bd1ca0bf6741066d2d396a">0x24…396a</a>
        👷‍♂️ Operator: <a href="https://scan.chainflip.io/operators/cFK9JepxsSEHLfT4eA8TNohzAXWmQAQjRgZg3PWLb8s2DBq4n">cFK9…Bq4n</a>
        💰 Amount: <strong>1 FLIP</strong> ($0.75)
        🧾 Transaction: <a href="https://etherscan.io/tx/0x20120047e442cc7358789f9bc38ebbc76e8e1400be6cba4db775edff3b8a56d1">0x201200…3b8a56d1</a>",
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
        🤴 Delegator: [0x24…396a](https://etherscan.io/tx//addresses/0x2412487875b155d901bd1ca0bf6741066d2d396a)
        👷‍♂️ Operator: [cFK9…Bq4n](https://scan.chainflip.io/operators/cFK9JepxsSEHLfT4eA8TNohzAXWmQAQjRgZg3PWLb8s2DBq4n)
        💰 Amount: **1 FLIP** ($0.75)
        🧾 Transaction: [0x201200…3b8a56d1](https://etherscan.io/tx/0x20120047e442cc7358789f9bc38ebbc76e8e1400be6cba4db775edff3b8a56d1)",
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
        🤴 Delegator: 0x24…396a
        👷‍♂️ Operator: cFK9…Bq4n
        💰 Amount: 1 FLIP ($0.75)
        🧾 Transaction: https://etherscan.io/tx/0x20120047e442cc7358789f9bc38ebbc76e8e1400be6cba4db775edff3b8a56d1",
                  "opts": {
                    "disablePreview": true,
                  },
                  "platform": "twitter",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "DELEGATION_EVENT",
                  },
                  "message": "Undelegated from operator
        🤴 Delegator: <a href="https://etherscan.io/tx//addresses/0x2412487875b155d901bd1ca0bf6741066d2d396a">0x24…396a</a>
        👷‍♂️ Operator: <a href="https://scan.chainflip.io/operators/cFK9JepxsSEHLfT4eA8TNohzAXWmQAQjRgZg3PWLb8s2DBq4n">cFK9…Bq4n</a>
        💰 Amount: <strong>1 FLIP</strong> ($0.75)
        🧾 Transaction: <a href="https://etherscan.io/tx/0x409c6789a96d9f96a739796b6b29f1400c66c78e68af934f194563c8901682ec">0x409c67…901682ec</a>",
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
                  "message": "Undelegated from operator
        🤴 Delegator: [0x24…396a](https://etherscan.io/tx//addresses/0x2412487875b155d901bd1ca0bf6741066d2d396a)
        👷‍♂️ Operator: [cFK9…Bq4n](https://scan.chainflip.io/operators/cFK9JepxsSEHLfT4eA8TNohzAXWmQAQjRgZg3PWLb8s2DBq4n)
        💰 Amount: **1 FLIP** ($0.75)
        🧾 Transaction: [0x409c67…901682ec](https://etherscan.io/tx/0x409c6789a96d9f96a739796b6b29f1400c66c78e68af934f194563c8901682ec)",
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
                  "message": "Undelegated from operator
        🤴 Delegator: 0x24…396a
        👷‍♂️ Operator: cFK9…Bq4n
        💰 Amount: 1 FLIP ($0.75)
        🧾 Transaction: https://etherscan.io/tx/0x409c6789a96d9f96a739796b6b29f1400c66c78e68af934f194563c8901682ec",
                  "opts": {
                    "disablePreview": true,
                  },
                  "platform": "twitter",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "DELEGATION_EVENT",
                  },
                  "message": "Delegation increased
        🤴 Delegator: <a href="https://etherscan.io/tx//addresses/0x3d24c6dad54825d319669851155c6e7731634fc6">0x3d…4fc6</a>
        👷‍♂️ Operator: <a href="https://scan.chainflip.io/operators/cFNGtTHDY4pmcmDWu3mT2M3MyUv6ihLytxbynTxd14AVVdeu2">0xGensler</a>
        💰 Amount: <strong>95 FLIP</strong> ($70.92)
        🧾 Transaction: <a href="https://etherscan.io/tx/0x45152f313f7d1bb7ada11c6f8c1ebb4ef8796aca6c54270bd6dfe6671eb77b06">0x45152f…1eb77b06</a>",
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
                  "message": "Delegation increased
        🤴 Delegator: [0x3d…4fc6](https://etherscan.io/tx//addresses/0x3d24c6dad54825d319669851155c6e7731634fc6)
        👷‍♂️ Operator: [0xGensler](https://scan.chainflip.io/operators/cFNGtTHDY4pmcmDWu3mT2M3MyUv6ihLytxbynTxd14AVVdeu2)
        💰 Amount: **95 FLIP** ($70.92)
        🧾 Transaction: [0x45152f…1eb77b06](https://etherscan.io/tx/0x45152f313f7d1bb7ada11c6f8c1ebb4ef8796aca6c54270bd6dfe6671eb77b06)",
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
                  "message": "Delegation increased
        🤴 Delegator: 0x3d…4fc6
        👷‍♂️ Operator: 0xGensler
        💰 Amount: 95 FLIP ($70.92)
        🧾 Transaction: https://etherscan.io/tx/0x45152f313f7d1bb7ada11c6f8c1ebb4ef8796aca6c54270bd6dfe6671eb77b06",
                  "opts": {
                    "disablePreview": true,
                  },
                  "platform": "twitter",
                },
                "name": "messageRouter",
              },
              {
                "data": {
                  "filterData": {
                    "name": "DELEGATION_EVENT",
                  },
                  "message": "Delegation decreased
        🤴 Delegator: <a href="https://etherscan.io/tx//addresses/0xe4d56f7c4cee091494cd9e86c078b238fc7416c6">0xe4…16c6</a>
        👷‍♂️ Operator: <a href="https://scan.chainflip.io/operators/cFP6L3uSmPcxBWbyXziVGgFvYLytfxxLtAbF8Yk91mvcumnRq">0xDavid</a>
        💰 Amount: <strong>105 FLIP</strong> ($78.22)
        🧾 Transaction: <a href="https://etherscan.io/tx/0xe3346e55d197b58a31c4086fd2a0bb2c3ed7d10c0503bb7b849fca978abe05d2">0xe3346e…8abe05d2</a>",
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
                  "message": "Delegation decreased
        🤴 Delegator: [0xe4…16c6](https://etherscan.io/tx//addresses/0xe4d56f7c4cee091494cd9e86c078b238fc7416c6)
        👷‍♂️ Operator: [0xDavid](https://scan.chainflip.io/operators/cFP6L3uSmPcxBWbyXziVGgFvYLytfxxLtAbF8Yk91mvcumnRq)
        💰 Amount: **105 FLIP** ($78.22)
        🧾 Transaction: [0xe3346e…8abe05d2](https://etherscan.io/tx/0xe3346e55d197b58a31c4086fd2a0bb2c3ed7d10c0503bb7b849fca978abe05d2)",
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
                  "message": "Delegation decreased
        🤴 Delegator: 0xe4…16c6
        👷‍♂️ Operator: 0xDavid
        💰 Amount: 105 FLIP ($78.22)
        🧾 Transaction: https://etherscan.io/tx/0xe3346e55d197b58a31c4086fd2a0bb2c3ed7d10c0503bb7b849fca978abe05d2",
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
