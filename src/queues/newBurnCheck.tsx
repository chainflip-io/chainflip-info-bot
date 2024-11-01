import { BigNumber } from 'bignumber.js';
import { hoursToMilliseconds } from 'date-fns';
import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Link } from '../channels/formatting.js';
import { platforms } from '../config.js';
import getLatestBurnId from '../queries/getLatestBurnId.js';
import getNewBurn from '../queries/getNewBurn.js';
import { formatUsdValue } from '../utils/strings.js';

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
          🔥 Burned {amount.toFixed(2)} FLIP ({valueUsd ? formatUsdValue(valueUsd) : ''})! //{' '}
          <Link
            href={`https://scan.chainflip.io/events/${blockHeight}-${indexInBlock}`}
            platform={platform}
          >
            view block on explorer
          </Link>
        </>,
      ),
      validationData: { name: 'NEW_BURN' },
    },
  }));

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const latestBurn = await getNewBurn(job.data.lastBurnId);

  const data = getNextJobData({
    burnId: latestBurn?.id ?? job.data.lastBurnId,
  });
  const jobs = [{ name: 'scheduler', data: [data] }] as DispatchJobArgs[];
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

const initialize: Initializer<Name> = async (queue) => {
  const latestBurnId = await getLatestBurnId();
  const { data, opts } = getNextJobData({
    burnId: latestBurnId,
  });
  await queue.add(name, data, opts);
};

export const config: JobConfig<Name> = {
  name,
  initialize,
  processJob,
};
