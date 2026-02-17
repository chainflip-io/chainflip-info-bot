import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import pendingSwapStats from './pendingSwapStats.json' with { type: 'json' };

import { explorerClient } from '../../server.js';
import { config } from '../swapStatusCheck.js';

describe('swapStatusCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('check fresh swap status and send swap info message', async () => {
    vi.setSystemTime(new Date('2024-10-25T12:42:30+00:00'));

    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '77697',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
  });

  it('check pending swap status and move to a scheduler', async () => {
    vi.setSystemTime(new Date('2024-10-25T12:42:30+00:00'));
    vi.mocked(explorerClient.request).mockResolvedValue(pendingSwapStats);

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '77697',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [
          {
            "data": {
              "filterData": {
                "name": "SWAP_COMPLETED",
                "usdValue": 5611.3799573378,
              },
              "message": "🦐 Swap <strong><a href="https://scan.chainflip.io/swaps/77697">#77697</a></strong>
      📥 <strong>5,000 FLIP on Ethereum</strong> ($5,568.07)
      📤 <strong>5,616.094932 USDT on Ethereum</strong> ($5,611.38)
      ↩️ <strong>0 FLIP on Ethereum</strong> ($5,611.38)
      ⏱️ Took: <strong>1 min</strong>
      🟢 Delta: <strong>$43.31</strong> (0.78%)",
              "platform": "telegram",
            },
            "name": "messageRouter",
          },
          {
            "data": {
              "filterData": {
                "name": "SWAP_COMPLETED",
                "usdValue": 5611.3799573378,
              },
              "message": "🦐 Swap **[#77697](https://scan.chainflip.io/swaps/77697)**
      📥 **5,000 FLIP on Ethereum** ($5,568.07)
      📤 **5,616.094932 USDT on Ethereum** ($5,611.38)
      ↩️ **0 FLIP on Ethereum** ($5,611.38)
      ⏱️ Took: **1 min**
      🟢 Delta: **$43.31** (0.78%)",
              "platform": "discord",
            },
            "name": "messageRouter",
          },
          {
            "data": {
              "filterData": {
                "name": "SWAP_COMPLETED",
                "usdValue": 5611.3799573378,
              },
              "message": "🦐 Swap https://scan.chainflip.io/swaps/77697
      📥 5,000 FLIP on Ethereum ($5,568.07)
      📤 5,616.094932 USDT on Ethereum ($5,611.38)
      ↩️ 0 FLIP on Ethereum ($5,611.38)
      ⏱️ Took: 1 min
      🟢 Delta: $43.31 (0.78%)
      #chainflip $flip",
              "platform": "twitter",
            },
            "name": "messageRouter",
          },
        ],
      ]
    `);
  });

  it('check stale swap status', async () => {
    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '77697',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchInlineSnapshot(`
      [
        [],
      ]
    `);
  });

  it('contains affiliate broker info in swap message', async () => {
    vi.setSystemTime(new Date('2024-11-10T18:46:00.001+00:00'));
    const nativeId = '1318809';

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: nativeId,
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
  });

  it('subtracts out the refund egress amount from the ingress amount', async () => {
    vi.setSystemTime(new Date('2024-11-07T21:53:48+00:00'));

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId: '103045',
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
  });

  it('ignores fully refunded swaps', async () => {
    const swapRequestId = '103706';
    vi.setSystemTime(new Date('2024-11-08T13:08:42+00:00'));

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId,
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs).not.toHaveBeenCalled();
  });

  it('adds boost info', async () => {
    const swapRequestId = '103899';
    vi.setSystemTime(new Date('2024-11-08T15:28:36+00:00'));

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({
      data: {
        swapRequestId,
      } as JobData['swapStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.calls).toMatchSnapshot();
  });
});
