import { differenceInMinutes } from 'date-fns';
import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import { Bold, Link } from '../channels/formatting.js';
import env from '../env.js';
import getSwapInfo from '../queries/getSwapInfo.js';
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

const isSwapCompleted = (swapInfo: SwapInfo) => {
  return !!swapInfo?.completedEventId;
};

const isFreshCompleted = (swapInfo: SwapInfo) => {
  const executedAtTimestamp = swapInfo?.completedAt;

  if (!executedAtTimestamp) return !!executedAtTimestamp;

  const end = new Date(new Date().toISOString());
  const timeNumber = Date.parse(executedAtTimestamp);

  const completedInMinAgo = differenceInMinutes(end, timeNumber);

  return completedInMinAgo <= env.SWAP_MAX_AGE_IN_MINUTES;
};

const emoji = (depositValueUsd: number) => {
  if (depositValueUsd == null) return;

  switch (true) {
    case depositValueUsd > 100_000:
      return '🐳';
    case depositValueUsd > 50_000:
      return '🦈';
    case depositValueUsd > 25_000:
      return '🦀';
    case depositValueUsd > 10_000:
      return '🐟';
    default:
      return '🦐';
  }
};

const buildMessageData = ({
  swapInfo,
  platform,
}: {
  swapInfo: SwapInfo;
  platform: 'discord' | 'telegram';
}): Extract<DispatchJobArgs, { name: 'messageRouter' }> => {
  const message = swapInfo
    ? renderToStaticMarkup(
        <>
          <>
            {emoji(Number(swapInfo.depositValueUsd)) && ' '}Swap
            <Bold platform={platform}>
              <Link
                platform={platform}
                href={`https://scan.chainflip.io/swaps/${swapInfo.requestId}`}
              >
                #{swapInfo.requestId}
              </Link>
            </Bold>
            {'\n'}
          </>
          <>
            📥{' '}
            <Bold platform={platform}>
              {swapInfo.depositAmountFormatted} {swapInfo.sourceAsset.toUpperCase()}
            </Bold>{' '}
            ({formatUsdValue(swapInfo.depositValueUsd)}){'\n'}
          </>
          <>
            📥{' '}
            <Bold platform={platform}>
              {swapInfo.egressAmountFormatted} {swapInfo.destinationAsset.toUpperCase()}
            </Bold>{' '}
            ({formatUsdValue(swapInfo.egressValueUsd)}){'\n'}
          </>
          <>
            ⏱️ Took: <Bold platform={platform}>{swapInfo.duration}</Bold>
            {'\n'}
          </>
          <>
            {swapInfo.priceDeltaPercentage && Number(swapInfo.priceDeltaPercentage) < 0
              ? '🔴'
              : '🟢'}{' '}
            Delta: <Bold platform={platform}>{formatUsdValue(swapInfo.priceDelta)}</Bold> (
            {swapInfo.priceDeltaPercentage}%){'\n'}
          </>

          <>
            🏦 via <Bold platform={platform}>{swapInfo.brokerIdOrAlias}</Bold>
            {'\n'}
          </>

          {swapInfo.dcaChunks && (
            <>
              📓 Chunks: <Bold platform={platform}>{swapInfo.dcaChunks}</Bold>
              {'\n'}
            </>
          )}
        </>,
      )
    : '';

  return {
    name: 'messageRouter' as const,
    data: {
      platform,
      message,
      validationData: { name: 'NEW_SWAP', usdValue: Number(swapInfo?.egressValueUsd || 0) },
    },
  };
};

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const swapInfo = await getSwapInfo(job.data.swapRequestId);

  const jobs = [];
  if (isSwapCompleted(swapInfo) && isFreshCompleted(swapInfo)) {
    jobs.push(buildMessageData({ swapInfo, platform: 'discord' }));
    jobs.push(buildMessageData({ swapInfo, platform: 'telegram' }));
  } else if (isSwapCompleted(swapInfo) && !isFreshCompleted(swapInfo)) {
    return;
  } else {
    jobs.push({
      name: 'scheduler',
      data: [{ name, data: { swapRequestId: job.data.swapRequestId }, opts: { delay: 10_000 } }],
    } as const);
  }

  await dispatchJobs(jobs);
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
