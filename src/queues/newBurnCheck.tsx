import { formatUsdValue } from '@chainflip/utils/number';
import { BigNumber } from 'bignumber.js';
import { hoursToMilliseconds } from 'date-fns';
import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import { ExplorerLink, Line, Trailer } from '../channels/formatting.js';
import { platforms } from '../config.js';
import getLatestBurnId from '../queries/getLatestBurnId.js';
import getNewBurn from '../queries/getNewBurn.js';

const name = 'newBurnCheck';
type Name = typeof name;

type Data = {
  lastBurnId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const INTERVAL = 30_000;

export const getNextJobData = async (
  burnId: number | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newBurnCheck';

  return {
    name: 'scheduler',
    data: [{ name, data: { lastBurnId: burnId ?? (await getLatestBurnId()) } }],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

const buildMessages = ({
  amount,
  valueUsd,
  blockHeight,
  indexInBlock,
}: {
  amount: BigNumber;
  valueUsd?: string | null;
  blockHeight: number;
  indexInBlock: number;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => ({
    name: 'messageRouter' as const,
    data: {
      platform,
      message: renderToStaticMarkup(
        <>
          <Line>
            🔥 Burned {amount.toFixed(2)} FLIP{valueUsd && ` (${formatUsdValue(valueUsd)})`}!
          </Line>
          <Line>
            <ExplorerLink
              path={`/events/${blockHeight}-${indexInBlock}`}
              platform={platform}
              prefer="link"
            >
              View on explorer
            </ExplorerLink>
          </Line>
          <Trailer platform={platform} />
        </>,
      ).trimEnd(),
      filterData: { name: 'NEW_BURN' },
    },
  }));

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const latestBurn = await getNewBurn(job.data.lastBurnId);

  const jobs: DispatchJobArgs[] = [await getNextJobData(latestBurn?.id ?? job.data.lastBurnId)];
  if (latestBurn) {
    const {
      amount,
      valueUsd,
      event: {
        block: { timestamp },
        blockId,
        indexInBlock,
      },
    } = latestBurn;
    // We just want to send the message if the burn happened in the last 12 hours
    if (Date.now() - new Date(timestamp).getTime() <= hoursToMilliseconds(12)) {
      jobs.push(...buildMessages({ amount, valueUsd, blockHeight: blockId, indexInBlock }));
    }
  }

  await dispatchJobs(jobs);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
