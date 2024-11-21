import React from 'react';
import { unreachable } from '@chainflip/utils/assertion';
import { formatUsdValue } from '@chainflip/utils/number';
import { type BigNumber } from 'bignumber.js';
import { differenceInMinutes } from 'date-fns';
import { renderToStaticMarkup } from 'react-dom/server';
import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import { Bold, ExplorerLink, Line, Trailer } from '../channels/formatting.js';
import { platforms } from '../config.js';
import { BLOCK_TIME_IN_SECONDS, humanFriendlyAsset } from '../consts.js';
import env from '../env.js';
import { type ChainflipAsset } from '../graphql/generated/graphql.js';
import getSwapInfo from '../queries/getSwapInfo.js';
import { toFormattedAmount } from '../utils/chainflip.js';
import logger from '../utils/logger.js';

const name = 'swapStatusCheck';
type Name = typeof name;

type Data = {
  swapRequestId: string;
};

type SwapInfo = Awaited<ReturnType<typeof getSwapInfo>>;

declare global {
  interface JobData {
    [name]: Data;
  }
}

const isFresh = (swapInfo: SwapInfo) => {
  const completedAtTimestamp = swapInfo?.completedAt;

  if (!completedAtTimestamp) return false;

  return (
    differenceInMinutes(new Date(), Date.parse(completedAtTimestamp)) <= env.SWAP_MAX_AGE_IN_MINUTES
  );
};

const getSwapStatus = (swapInfo: SwapInfo) => {
  if (swapInfo.completedEventId) return isFresh(swapInfo) ? 'fresh' : 'stale';

  return 'pending';
};

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

export const UsdValue = ({ amount }: { amount: BigNumber | null }): React.JSX.Element | null => {
  if (!amount) return null;

  return <> ({formatUsdValue(amount)})</>;
};

export const TokenAmount = ({ amount, asset }: { amount: BigNumber; asset: ChainflipAsset }) => (
  <>
    {toFormattedAmount(amount)} {humanFriendlyAsset[asset]}
  </>
);

const buildMessageData = ({
  swapInfo,
}: {
  swapInfo: SwapInfo;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => {
    const message = renderToStaticMarkup(
      <>
        <Line>
          {emoji(swapInfo.depositValueUsd)} Swap{' '}
          <Bold platform={platform}>
            <ExplorerLink platform={platform} path={`/swaps/${swapInfo.requestId}`} prefer="link">
              #{swapInfo.requestId}
            </ExplorerLink>
          </Bold>
        </Line>
        <Line>
          📥{' '}
          <Bold platform={platform}>
            <TokenAmount amount={swapInfo.depositAmount} asset={swapInfo.sourceAsset} />
          </Bold>
          <UsdValue amount={swapInfo.depositValueUsd} />
        </Line>
        {swapInfo.egressAmount && (
          <Line>
            📤{' '}
            <Bold platform={platform}>
              <TokenAmount amount={swapInfo.egressAmount} asset={swapInfo.destinationAsset} />
            </Bold>
            <UsdValue amount={swapInfo.egressValueUsd} />
          </Line>
        )}
        {swapInfo.refundAmount && (
          <Line>
            ↩️{' '}
            <Bold platform={platform}>
              <TokenAmount amount={swapInfo.refundAmount} asset={swapInfo.sourceAsset} />
            </Bold>
            <UsdValue amount={swapInfo.refundValueUsd} />
          </Line>
        )}
        {swapInfo.duration && (
          <Line>
            ⏱️ Took: <Bold platform={platform}>{swapInfo.duration}</Bold>
          </Line>
        )}
        {swapInfo.priceDelta !== null && swapInfo.priceDeltaPercentage && (
          <Line>
            {deltaSign(Number(swapInfo.priceDeltaPercentage))} Delta:{' '}
            <Bold platform={platform}>
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
            📓 Chunks: <Bold platform={platform}>{swapInfo.dcaChunks}</Bold>
          </Line>
        )}
        {swapInfo.boostFee.gt(0) && (
          <Line>
            ⚡ <Bold platform={platform}>Boosted</Bold> for{' '}
            <Bold platform={platform}>{formatUsdValue(swapInfo.boostFee)}</Bold>
          </Line>
        )}
        {swapInfo.brokerIdAndAlias && (
          <Line>
            🏦 via{' '}
            <Bold platform={platform}>
              <ExplorerLink
                platform={platform}
                path={`/brokers/${swapInfo.brokerIdAndAlias.brokerId}`}
                prefer="text"
              >
                {swapInfo.brokerIdAndAlias.alias}
              </ExplorerLink>
            </Bold>
          </Line>
        )}
        {swapInfo.affiliatesIdsAndAliases?.length ? (
          <Line>
            🏰 Affiliate:{' '}
            {swapInfo.affiliatesIdsAndAliases?.map((affiliate) => (
              <Bold key={affiliate.brokerId} platform={platform}>
                <ExplorerLink
                  platform={platform}
                  path={`/brokers/${affiliate.brokerId}`}
                  prefer="text"
                >
                  {affiliate.alias}
                </ExplorerLink>{' '}
              </Bold>
            ))}
          </Line>
        ) : null}
        <Trailer platform={platform} />
      </>,
    ).trimEnd();

    return {
      name: 'messageRouter' as const,
      data: {
        platform,
        message,
        filterData: { name: 'NEW_SWAP', usdValue: swapInfo.egressValueUsd?.toNumber() || 0 },
      },
    };
  });

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(`Checking swap #${job.data.swapRequestId}`);
  const swapInfo = await getSwapInfo(job.data.swapRequestId);

  const jobs = [] as DispatchJobArgs[];

  if (
    swapInfo.completedEventId &&
    (swapInfo.egressAmount === null || swapInfo.egressAmount.isZero())
  ) {
    logger.info(`Swap egress amount is zero, so it was refunded`);
    return;
  }

  const status = getSwapStatus(swapInfo);

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
