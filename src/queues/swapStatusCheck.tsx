import { unreachable } from '@chainflip/utils/assertion';
import { AnyChainflipChain, assetConstants } from '@chainflip/utils/chainflip';
import { abbreviate } from '@chainflip/utils/string';
import type BigNumber from 'bignumber.js';
import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import { type SwapBannerData } from '../banners/buildBanner.js';
import { formatDiscordMessage } from '../banners/discordMessage.js';
import { formatAggregator } from '../banners/format.js';
import {
  Bold,
  ExplorerLink,
  Line,
  renderForPlatform,
  TokenAmount,
  Trailer,
  UsdValue,
} from '../channels/formatting.js';
import { type Platform, platforms } from '../config.js';
import { BLOCK_TIME_IN_SECONDS } from '../consts.js';
import getSwapInfo from '../queries/getSwapInfo.js';
import { formatUsdValue } from '../utils/functions.js';
import logger from '../utils/logger.js';

const name = 'swapStatusCheck';
type Name = typeof name;

type Data = {
  swapRequestId: `${number}`;
};

type SwapInfo = Awaited<ReturnType<typeof getSwapInfo>>;

declare global {
  interface JobData {
    [name]: Data;
  }
}

const emoji = (depositValueUsd: BigNumber | null) => {
  if (!depositValueUsd) return null;
  if (depositValueUsd.gt(100_000)) return '🐳';
  if (depositValueUsd.gt(50_000)) return '🦈';
  if (depositValueUsd.gt(25_000)) return '🐟';
  if (depositValueUsd.gt(10_000)) return '🦀';
  return '🦐';
};

const formatDeltaPrice = (value: string, deltaSign: boolean) => (deltaSign ? `-${value}` : value);

const deltaSign = (delta: number) => {
  if (delta <= -10) return '🔴';
  if (delta < -1) return '⚪️';
  return '🟢';
};

const BANNER_MIN_USD_VALUE = 95_000;

const BOOST_TIME_SAVED_MINUTES_BY_CHAIN: Record<AnyChainflipChain, number> = {
  Bitcoin: 20,
  Ethereum: 0,
  Arbitrum: 0,
  Solana: 0,
  Assethub: 0,
  Polkadot: 0,
};

const buildBannerData = (swapInfo: SwapInfo): SwapBannerData | undefined => {
  const usdValue = swapInfo.outputValueUsd?.toNumber() ?? swapInfo.inputValueUsd?.toNumber();
  const sourceAmount = swapInfo.inputAmount?.toNumber();
  const destAmount = swapInfo.outputAmount?.toNumber();
  if (
    usdValue === undefined ||
    usdValue < BANNER_MIN_USD_VALUE ||
    sourceAmount === undefined ||
    destAmount === undefined
  ) {
    return undefined;
  }
  const isBoosted = swapInfo.boostFee?.gt(0) ?? false;
  const sourceChain = assetConstants[swapInfo.sourceAsset]?.chain;
  const savedMinutes = sourceChain && BOOST_TIME_SAVED_MINUTES_BY_CHAIN[sourceChain];
  const originalDurationMinutes =
    isBoosted &&
    swapInfo.durationMinutes !== undefined &&
    savedMinutes !== undefined &&
    savedMinutes > 0
      ? swapInfo.durationMinutes + savedMinutes
      : undefined;
  return {
    usdValue,
    isBoosted,
    sourceAsset: swapInfo.sourceAsset,
    sourceAmount,
    destAsset: swapInfo.destinationAsset,
    destAmount,
    durationMinutes: swapInfo.durationMinutes,
    originalDurationMinutes,
    aggregator: formatAggregator(
      swapInfo.affiliatesIdsAndAliases[0]?.alias ?? swapInfo.brokerIdAndAlias?.alias,
    ),
    oraclePriceDeltaPct: swapInfo.oraclePriceDeltaPercentage
      ? Number(swapInfo.oraclePriceDeltaPercentage)
      : 0,
  };
};

const renderDefaultMessage = (platform: Platform, swapInfo: SwapInfo) =>
  renderForPlatform(
    platform,
    <>
      <Line>
        {emoji(swapInfo.inputValueUsd)}
        {swapInfo.isLiquidation && ' Liquidation'} Swap{' '}
        <Bold>
          <ExplorerLink path={`/swaps/${swapInfo.requestId}`} prefer="link">
            #{swapInfo.requestId}
          </ExplorerLink>
        </Bold>
      </Line>
      <Line>
        📥{' '}
        <Bold>
          <TokenAmount amount={swapInfo.inputAmount} asset={swapInfo.sourceAsset} />
        </Bold>
        <UsdValue amount={swapInfo.inputValueUsd} />
      </Line>
      {swapInfo.outputAmount && (
        <Line>
          📤{' '}
          <Bold>
            <TokenAmount amount={swapInfo.outputAmount} asset={swapInfo.destinationAsset} />
          </Bold>
          <UsdValue amount={swapInfo.outputValueUsd} />
        </Line>
      )}
      {swapInfo.refundAmount && (
        <Line>
          ↩️{' '}
          <Bold>
            <TokenAmount amount={swapInfo.refundAmount} asset={swapInfo.sourceAsset} />
          </Bold>
          <UsdValue amount={swapInfo.refundValueUsd} />
        </Line>
      )}
      {swapInfo.duration && (
        <Line>
          ⏱️ Took: <Bold>{swapInfo.duration}</Bold>
        </Line>
      )}
      {swapInfo.priceDelta !== null && swapInfo.priceDeltaPercentage && (
        <Line>
          {deltaSign(Number(swapInfo.priceDeltaPercentage))} Swap Price delta:{' '}
          <Bold>
            {formatDeltaPrice(
              formatUsdValue(swapInfo.priceDelta.abs()),
              swapInfo.priceDelta.isNegative(),
            )}
          </Bold>{' '}
          ({swapInfo.priceDeltaPercentage}%)
        </Line>
      )}
      {swapInfo.oraclePriceDeltaPercentage && (
        <Line>
          {deltaSign(Number(swapInfo.oraclePriceDeltaPercentage))} Oracle Price delta:{' '}
          <Bold>{swapInfo.oraclePriceDeltaPercentage}%</Bold>
        </Line>
      )}
      {swapInfo.dcaChunks && (
        <Line>
          📓 Chunks: <Bold>{swapInfo.dcaChunks}</Bold>
        </Line>
      )}
      {swapInfo.boostFee.gt(0) && (
        <Line>
          ⚡ <Bold>Boosted</Bold> for <Bold>{formatUsdValue(swapInfo.boostFee)}</Bold>
        </Line>
      )}
      {swapInfo.brokerIdAndAlias && (
        <Line>
          🏦 via{' '}
          <Bold>
            <ExplorerLink path={`/brokers/${swapInfo.brokerIdAndAlias.brokerId}`} prefer="text">
              {swapInfo.brokerIdAndAlias.alias}
            </ExplorerLink>
          </Bold>
        </Line>
      )}
      {swapInfo.onChainInfo?.lp && (
        <Line>
          🔗 by{' '}
          <Bold>
            <ExplorerLink path={`/lps/${swapInfo.onChainInfo?.lp.idSs58}`} prefer="text">
              {swapInfo.onChainInfo?.lp.alias ?? abbreviate(swapInfo.onChainInfo?.lp.idSs58, 8)}
            </ExplorerLink>
          </Bold>
        </Line>
      )}
      {swapInfo.affiliatesIdsAndAliases?.length ? (
        <Line>
          🏰 Affiliate:{' '}
          {swapInfo.affiliatesIdsAndAliases?.map((affiliate) => (
            <Bold key={affiliate.brokerId}>
              <ExplorerLink path={`/brokers/${affiliate.brokerId}`} prefer="text">
                {affiliate.alias}
              </ExplorerLink>{' '}
            </Bold>
          ))}
        </Line>
      ) : null}
      <Trailer />
    </>,
  ).trimEnd();

const buildMessageData = ({
  swapInfo,
}: {
  swapInfo: SwapInfo;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] => {
  const banner = buildBannerData(swapInfo);
  const isInternalSwap = swapInfo.onChainInfo != null; // skip internal swaps
  return platforms
    .filter((platform) => !(isInternalSwap && platform === 'twitter'))
    .map((platform) => {
      const message =
        (platform === 'discord' || platform === 'twitter') && banner
          ? formatDiscordMessage({
              usdValue: banner.usdValue,
              sourceAsset: banner.sourceAsset,
              sourceAmount: banner.sourceAmount,
              destAsset: banner.destAsset,
              destAmount: banner.destAmount,
              brokerAlias: swapInfo.brokerIdAndAlias?.alias,
              affiliateAlias: swapInfo.affiliatesIdsAndAliases[0]?.alias,
              swapId: swapInfo.requestId,
              durationMinutes: swapInfo.durationMinutes,
              isBoosted: banner.isBoosted,
              originalDurationMinutes: banner.originalDurationMinutes,
              oraclePriceDeltaPct: swapInfo.oraclePriceDeltaPercentage
                ? Number(swapInfo.oraclePriceDeltaPercentage)
                : undefined,
            })
          : renderDefaultMessage(platform, swapInfo);

      return {
        name: 'messageRouter' as const,
        data: {
          platform,
          message,
          filterData: {
            name: 'SWAP_COMPLETED',
            usdValue: swapInfo.outputValueUsd?.toNumber() || 0,
          },
          banner,
        },
      };
    });
};

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(`Checking swap #${job.data.swapRequestId}`);
  const swapInfo = await getSwapInfo(job.data.swapRequestId);

  const jobs = [] as DispatchJobArgs[];

  if (
    swapInfo.completedEventId &&
    (swapInfo.outputAmount === null || swapInfo.outputAmount.isZero())
  ) {
    logger.info(`Swap egress amount is zero, so it was refunded`);
    return;
  }

  const status = swapInfo.freshness;

  if (status === 'fresh') {
    jobs.push(...buildMessageData({ swapInfo }));
    logger.info(`Swap #${swapInfo.requestId} is fresh, job was added in a queue`);
  } else if (status === 'stale') {
    logger.warn(`Swap #${swapInfo.requestId} is stale`);
  } else if (status === 'pending') {
    jobs.push({
      name: 'scheduler',
      data: [{ name, data: { swapRequestId: job.data.swapRequestId } }],
      opts: {
        delay: swapInfo.chunkIntervalBlocks * BLOCK_TIME_IN_SECONDS,
      },
    } as const);
    logger.info(`Swap #${swapInfo.requestId} is not completed, pushed to a scheduler`);
  } else {
    unreachable(status);
  }

  await dispatchJobs(jobs);
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
