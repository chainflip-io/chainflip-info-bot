import { BigNumber } from 'bignumber.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Link } from '../channels/formatting.js';
import getLatestBurnId from '../queries/getLatestBurnId.js';
import getNewBurns from '../queries/getNewBurns.js';
import { formatUsdValue } from '../utils.js';

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

const getNextJobData = ({
  burnId,
}: {
  burnId: number;
}): Extract<DispatchJobArgs, { name: Name }> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newBurnCheck';

  return {
    name,
    data: { lastBurnId: burnId },
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

const buildMessageData = ({
  amount,
  valueUsd,
  blockHeight,
  indexInBlock,
  channel,
}: {
  amount: BigNumber;
  valueUsd?: string | null;
  blockHeight: number;
  indexInBlock: number;
  channel: 'discord' | 'telegram';
}) => ({
  name: 'messages' as const,
  data: {
    channel,
    message: renderToStaticMarkup(
      <>
        🔥 Burned {amount.toFixed(2)} FLIP ({valueUsd ? formatUsdValue(valueUsd) : ''})! //{' '}
        <Link
          href={`https://scan.chainflip.io/events/${blockHeight}-${indexInBlock}`}
          channel={channel}
        >
          view block on explorer
        </Link>
      </>,
    ),
  },
});

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const latestBurns = await getNewBurns(job.data.lastBurnId);

  const latestBurn = latestBurns[0];

  const jobs = [];
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
    if (new Date(timestamp).getTime() > Date.now() - 12 * 3600 * 1000) {
      jobs.push(
        buildMessageData({
          amount,
          valueUsd,
          blockHeight: blockId,
          indexInBlock,
          channel: 'telegram',
        }),
        buildMessageData({
          amount,
          valueUsd,
          blockHeight: blockId,
          indexInBlock,
          channel: 'discord',
        }),
      );
    }
  }

  const data = getNextJobData({
    burnId: latestBurn?.id ?? job.data.lastBurnId,
  });
  jobs.push({ name: 'scheduler' as const, data: [data] });
  await dispatchJobs(jobs);
};

const initialize: Initializer<Name> = async (queue) => {
  const latestBurn = await getLatestBurnId();
  const { data, opts } = getNextJobData({
    burnId: latestBurn.id,
  });
  await queue.add(name, data, opts);
};

export const config: JobConfig<Name> = {
  name,
  initialize,
  processJob,
};
