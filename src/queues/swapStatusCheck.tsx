import React from 'react';
import { differenceInMinutes } from 'date-fns';
import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import { Bold, ExplorerLink, Line, Trailer } from '../channels/formatting.js';
import { platforms } from '../config.js';
import { humanFriendlyAsset } from '../consts.js';
import env from '../env.js';
import getSwapInfo from '../queries/getSwapInfo.js';
import logger from '../utils/logger.js';
import { formatUsdValue } from '../utils/strings.js';

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

const emoji = (depositValueUsd: string | null | undefined) => {
  if (!depositValueUsd) return null;
  const value = Number.parseFloat(depositValueUsd);
  if (value > 100_000) return '🐳';
  if (value > 50_000) return '🦈';
  if (value > 25_000) return '🐟';
  if (value > 10_000) return '🦀';
  return '🦐';
};

const formatDeltaPrice = (value: string, deltaSign: boolean) => {
  return deltaSign ? '-' + value : value;
};

const deltaSign = (delta: number) => {
  if (delta <= -10) return '🔴';
  if (delta < -1) return '⚪️';
  return '🟢';
};

const UsdValue = ({ amount }: { amount: string | null | undefined }): React.JSX.Element | null => {
  if (!amount) return null;

  return <> ({formatUsdValue(amount)})</>;
};

const buildMessageData = ({
  swapInfo,
}: {
  swapInfo: SwapInfo;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => {
    const message = renderToStaticMarkup(
      <>
        <Line>
          {emoji(swapInfo.originalDepositValueUsd)} Swap{' '}
          <Bold platform={platform}>
            <ExplorerLink platform={platform} path={`swaps/${swapInfo.requestId}`} prefer="link">
              #{swapInfo.requestId}
            </ExplorerLink>
          </Bold>
        </Line>
        <Line>
          📥{' '}
          <Bold platform={platform}>
            {swapInfo.depositAmount} {humanFriendlyAsset[swapInfo.sourceAsset]}
          </Bold>
          <UsdValue amount={swapInfo.depositValueUsd} />
        </Line>
        {swapInfo.egressAmount && (
          <Line>
            📤{' '}
            <Bold platform={platform}>
              {swapInfo.egressAmount} {humanFriendlyAsset[swapInfo.destinationAsset]}
            </Bold>
            <UsdValue amount={swapInfo.egressValueUsd} />
          </Line>
        )}
        {swapInfo.refundAmount && (
          <Line>
            ↩️{' '}
            <Bold platform={platform}>
              {swapInfo.refundAmount} {humanFriendlyAsset[swapInfo.sourceAsset]}
            </Bold>
            <UsdValue amount={swapInfo.refundValueUsd} />
          </Line>
        )}
        {swapInfo.duration && (
          <Line>
            ⏱️ Took: <Bold platform={platform}>{swapInfo.duration}</Bold>
          </Line>
        )}
        {swapInfo.priceDelta && swapInfo.priceDeltaPercentage && (
          <Line>
            {deltaSign(Number(swapInfo.priceDeltaPercentage))} Delta:{' '}
            <Bold platform={platform}>
              {formatDeltaPrice(
                formatUsdValue(Math.abs(swapInfo.priceDelta)),
                Number(swapInfo.priceDeltaPercentage) < 0,
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
        {swapInfo.effectiveBoostFeeBps && swapInfo.boostFee && (
          <Line>
            ⚡ <Bold platform={platform}>Boosted </Bold> for{' '}
            <Bold platform={platform}>{formatUsdValue(swapInfo.boostFee.valueUsd)}</Bold>
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
        <Trailer platform={platform} />
      </>,
    ).trimEnd();

    return {
      name: 'messageRouter' as const,
      data: {
        platform,
        message,
        filterData: { name: 'NEW_SWAP', usdValue: Number(swapInfo?.egressValueUsd || 0) },
      },
    };
  });

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(`Checking swap #${job.data.swapRequestId}`);
  const swapInfo = await getSwapInfo(job.data.swapRequestId);

  const jobs = [] as DispatchJobArgs[];

  if (swapInfo.completedEventId && Number(swapInfo.egressAmount) === 0) {
    logger.info(`Swap egress amount is zero, so it was refunded`);
    return;
  }

  const status = getSwapStatus(swapInfo);

  switch (status) {
    case 'fresh':
      jobs.push(...buildMessageData({ swapInfo }));
      logger.info(`Swap #${swapInfo.requestId} is fresh, job was added in a queue`);
      break;

    case 'stale':
      logger.warn(`Swap #${swapInfo.requestId} is stale`);
      break;

    case 'pending':
      jobs.push({
        name: 'scheduler',
        data: [{ name, data: { swapRequestId: job.data.swapRequestId }, opts: { delay: 10_000 } }],
      } as const);
      logger.info(`Swap #${swapInfo.requestId} is not completed, pushed to a scheduler`);
      break;
  }

  await dispatchJobs(jobs);
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
