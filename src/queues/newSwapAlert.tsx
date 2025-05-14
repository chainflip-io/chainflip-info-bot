import { renderToStaticMarkup } from 'react-dom/server';
import { type JobConfig, type DispatchJobArgs, type JobProcessor } from './initialize.js';
import { Bold, ExplorerLink, Line, TokenAmount, UsdValue } from '../channels/formatting.js';
import { platforms } from '../config.js';
import { humanFriendlyAsset } from '../consts.js';
import getSwapInfo from '../queries/getSwapInfo.js';
import baseLogger from '../utils/logger.js';

const name = 'newSwapAlert';
type Name = typeof name;

const logger = baseLogger.child({ queue: name });

type Data = {
  swapRequestId: `${number}`;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

type SwapInfo = Awaited<ReturnType<typeof getSwapInfo>>;

const buildMessageData = ({
  swapInfo,
}: {
  swapInfo: SwapInfo;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => {
    const message = renderToStaticMarkup(
      <>
        <Line>
          New swap detected:{' '}
          <Bold platform={platform}>
            <ExplorerLink platform={platform} path={`/swaps/${swapInfo.requestId}`} prefer="link">
              #{swapInfo.requestId}
            </ExplorerLink>
          </Bold>
        </Line>
        <Line>
          Swapping <Bold platform={platform}>{humanFriendlyAsset[swapInfo.sourceAsset]}</Bold> for{' '}
          <Bold platform={platform}>{humanFriendlyAsset[swapInfo.destinationAsset]}</Bold>
        </Line>
        <Line>
          📥{' '}
          <Bold platform={platform}>
            <TokenAmount amount={swapInfo.depositAmount} asset={swapInfo.sourceAsset} />
          </Bold>
          <UsdValue amount={swapInfo.depositValueUsd} />
        </Line>
        {swapInfo.depositAddress && (
          <Line>
            Deposit address: <Bold platform={platform}>{swapInfo.depositAddress}</Bold>
          </Line>
        )}
        <Line>
          Destination address: <Bold platform={platform}>{swapInfo.destinationAddress}</Bold>
        </Line>
        {swapInfo.transactionRefs.length > 0 && (
          <>
            <Line>Transaction refs:</Line>
            {swapInfo.transactionRefs.map(({ ref, chain }) => (
              <Line key={ref}>
                {ref}{' '}
                <ExplorerLink key={ref} path={ref} chain={chain} platform={platform} prefer="text">
                  [view]
                </ExplorerLink>
              </Line>
            ))}
          </>
        )}
      </>,
    ).trimEnd();

    return {
      name: 'messageRouter' as const,
      data: {
        platform,
        message,
        filterData: { name: 'NEW_SWAP', usdValue: swapInfo.depositValueUsd?.toNumber() || 0 },
        opts: { disablePreview: true },
      },
    };
  });

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(job.data, 'Alerting about new swap request');

  const swapInfo = await getSwapInfo(job.data.swapRequestId);

  if (swapInfo.freshness !== 'stale') {
    await dispatchJobs(buildMessageData({ swapInfo }));
  } else {
    logger.warn({ swapRequestId: job.data.swapRequestId }, 'skipping stale job');
  }
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
