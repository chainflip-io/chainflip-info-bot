import BigNumber from 'bignumber.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import getLargestSwapValue from '../../queries/getLargestSwapValue.js';
import getSwapInfo from '../../queries/getSwapInfo.js';
import { config } from '../swapStatusCheck.js';

vi.mock('../../queries/getSwapInfo');
vi.mock('../../queries/getLargestSwapValue');

// Minimal fresh swap; only the fields the fresh-swap path reads are populated.
const freshSwap = (outputUsd: number) =>
  ({
    completedEventId: '1',
    requestId: '9999999',
    inputAmount: new BigNumber(50),
    inputValueUsd: new BigNumber(outputUsd),
    outputAmount: new BigNumber(outputUsd),
    outputValueUsd: new BigNumber(outputUsd),
    refundAmount: null,
    refundValueUsd: null,
    duration: '11min',
    durationMinutes: 11,
    priceDelta: null,
    priceDeltaPercentage: null,
    oraclePriceDeltaPercentage: '-0.04',
    brokerIdAndAlias: undefined,
    affiliatesIdsAndAliases: [],
    chunkIntervalBlocks: 2,
    dcaChunks: undefined,
    sourceAsset: 'Btc',
    destinationAsset: 'Usdc',
    boostFee: new BigNumber(0),
    isLiquidation: false,
    onChainInfo: null,
    freshness: 'fresh',
    transactionRefs: [],
  }) as unknown as Awaited<ReturnType<typeof getSwapInfo>>;

const bannersFrom = (dispatchJobs: ReturnType<typeof vi.fn>) => {
  const [jobs] = dispatchJobs.mock.lastCall as [{ data: { banner?: { isRecord?: boolean } } }[]];
  return jobs.map((j) => j.data.banner).filter((b): b is { isRecord?: boolean } => Boolean(b));
};

describe('swapStatusCheck record banner', () => {
  afterEach(() => vi.clearAllMocks());

  it('flags a swap larger than the previous all-time max as a record', async () => {
    vi.mocked(getSwapInfo).mockResolvedValue(freshSwap(4_250_000));
    vi.mocked(getLargestSwapValue).mockResolvedValue(4_000_000);

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({ data: { swapRequestId: '9999999' } } as any);

    expect(getLargestSwapValue).toHaveBeenCalledWith('9999999');
    const banners = bannersFrom(dispatchJobs);
    expect(banners.length).toBeGreaterThan(0);
    banners.forEach((b) => expect(b.isRecord).toBe(true));

    // Record wording is X-only: twitter caption says "New record", discord does not.
    const [jobs] = dispatchJobs.mock.lastCall as [
      { data: { platform: string; message: string } }[],
    ];
    const msg = (platform: string) =>
      jobs.find((j) => j.data.platform === platform)?.data.message ?? '';
    expect(msg('twitter')).toContain('New record');
    expect(msg('discord')).not.toContain('New record');
  });

  it('does not flag a record when a larger swap already exists', async () => {
    vi.mocked(getSwapInfo).mockResolvedValue(freshSwap(2_000_000));
    vi.mocked(getLargestSwapValue).mockResolvedValue(4_200_000);

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({ data: { swapRequestId: '9999999' } } as any);

    bannersFrom(dispatchJobs).forEach((b) => expect(b.isRecord).toBe(false));
  });

  it('skips the record lookup for swaps below the top tier', async () => {
    vi.mocked(getSwapInfo).mockResolvedValue(freshSwap(50_000));

    const dispatchJobs = vi.fn();
    await config.processJob(dispatchJobs)({ data: { swapRequestId: '9999999' } } as any);

    expect(getLargestSwapValue).not.toHaveBeenCalled();
  });
});
