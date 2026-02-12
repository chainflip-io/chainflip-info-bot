import { type JobConfig, type DispatchJobArgs, type JobProcessor } from './initialize.js';
import {
  Bold,
  ExplorerLink,
  Line,
  renderForPlatform,
  TokenAmount,
  UsdValue,
} from '../channels/formatting.js';
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
    const message = renderForPlatform(
      platform,
      <>
        <Line>
          New swap detected:{' '}
          <Bold>
            <ExplorerLink path={`/swaps/${swapInfo.requestId}`} prefer="link">
              #{swapInfo.requestId}
            </ExplorerLink>
          </Bold>
        </Line>
        <Line>
          Swapping <Bold>{humanFriendlyAsset[swapInfo.sourceAsset]}</Bold> for{' '}
          <Bold>{humanFriendlyAsset[swapInfo.destinationAsset]}</Bold>
        </Line>
        <Line>
          📥{' '}
          <Bold>
            <TokenAmount amount={swapInfo.inputAmount} asset={swapInfo.sourceAsset} />
          </Bold>
          <UsdValue amount={swapInfo.inputValueUsd} />
        </Line>
        {swapInfo.depositAddress && (
          <Line>
            Deposit address: <Bold>{swapInfo.depositAddress}</Bold>
          </Line>
        )}
        <Line>
          Destination address: <Bold>{swapInfo.destinationAddress}</Bold>
        </Line>
        {swapInfo.transactionRefs.length > 0 && (
          <>
            <Line>Transaction refs:</Line>
            {swapInfo.transactionRefs.map(({ ref, chain }) => (
              <Line key={ref}>
                {ref}{' '}
                <ExplorerLink key={ref} path={ref} chain={chain} prefer="text">
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
        filterData: { name: 'NEW_SWAP', usdValue: swapInfo.inputValueUsd?.toNumber() || 0 },
        opts: { disablePreview: true },
      },
    };
  });

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info('Alerting about new swap request', job.data);

  const swapInfo = await getSwapInfo(job.data.swapRequestId);

  if (swapInfo.freshness !== 'stale') {
    await dispatchJobs(buildMessageData({ swapInfo }));
  } else {
    logger.warn('skipping stale job', { swapRequestId: job.data.swapRequestId });
  }
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
