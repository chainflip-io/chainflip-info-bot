import { unreachable } from '@chainflip/utils/assertion';
import { abbreviate } from '@chainflip/utils/string';
import type BigNumber from 'bignumber.js';
import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import {
  Bold,
  ExplorerLink,
  Line,
  renderForPlatform,
  TokenAmount,
  Trailer,
  UsdValue,
} from '../channels/formatting.js';
import { platforms } from '../config.js';
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

const buildMessageData = ({
  swapInfo,
}: {
  swapInfo: SwapInfo;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => {
    const message = renderForPlatform(
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
            {deltaSign(Number(swapInfo.priceDeltaPercentage))} Delta:{' '}
            <Bold>
              {formatDeltaPrice(
                formatUsdValue(swapInfo.priceDelta.abs()),
                swapInfo.priceDelta.isNegative(),
              )}
            </Bold>{' '}
            ({swapInfo.priceDeltaPercentage}%)
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

    return {
      name: 'messageRouter' as const,
      data: {
        platform,
        message,
        filterData: { name: 'SWAP_COMPLETED', usdValue: swapInfo.outputValueUsd?.toNumber() || 0 },
      },
    };
  });

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
