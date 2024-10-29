import { utc } from '@date-fns/utc';
import { JobsOptions, UnrecoverableError } from 'bullmq';
import { endOfToday, endOfWeek, hoursToMilliseconds, startOfDay, startOfWeek } from 'date-fns';
import { renderToStaticMarkup } from 'react-dom/server';
import { Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Bold } from '../channels/formatting.js';
import getSwapVolumeStats, { SwapStats } from '../queries/swapVolume.js';
import { formatUsdValue } from '../utils.js';

const name = 'timePeriodStats';

type Data = {
  endOfPeriod: number;
  sendWeeklySummary: boolean;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const getNextJobData = (): { data: JobData[typeof name]; opts: JobsOptions } => {
  const endOfPeriod = endOfToday({ in: utc }).valueOf();
  // prevents multiple jobs with the same key from being scheduled

  const customJobId = `timePeriodStatsSingleton-${endOfPeriod}`;

  return {
    data: {
      endOfPeriod,
      sendWeeklySummary:
        endOfPeriod === endOfWeek(endOfPeriod, { weekStartsOn: 1, in: utc }).valueOf(),
    },
    opts: { delay: endOfPeriod - Date.now(), jobId: customJobId },
  };
};

const buildMessageData = ({
  stats,
  date,
  isDaily = true,
  channel,
}: {
  stats: SwapStats;
  date: Date;
  isDaily?: boolean;
  channel: 'discord' | 'telegram';
}) => ({
  name: 'messages' as const,
  data: {
    channel,
    message: renderToStaticMarkup(
      <>
        📊 {isDaily ? 'On' : 'For the week ending'}{' '}
        <Bold channel={channel}>{date.toISOString().slice(0, 10)}</Bold>, we had a volume of{' '}
        <Bold channel={channel}>{formatUsdValue(stats.swapVolume)}</Bold> with{' '}
        <Bold channel={channel}>{formatUsdValue(stats.networkFees)}</Bold> of network fees and{' '}
        <Bold channel={channel}>{formatUsdValue(stats.lpFees)}</Bold> in LP fees.
        {stats.flipBurned && (
          <>
            {' '}
            Also, we burned <Bold channel={channel}>{stats.flipBurned.toFixed(2)}</Bold> FLIP
            tokens.
          </>
        )}
      </>,
    ),
  },
});

const processJob: JobProcessor<typeof name> = (dispatchJobs) => async (job) => {
  const { endOfPeriod, sendWeeklySummary } = job.data;

  const timeElapsedSinceEndOfPeriod = Date.now() - endOfPeriod;

  if (timeElapsedSinceEndOfPeriod > hoursToMilliseconds(12)) {
    throw new UnrecoverableError('job is stale');
  }

  const beginningOfDay = startOfDay(endOfPeriod, { in: utc });
  const beginningOfWeek = sendWeeklySummary
    ? startOfWeek(endOfPeriod, { weekStartsOn: 1, in: utc })
    : null;

  const [dailyVolume, maybeWeeklyVolume] = await Promise.all([
    getSwapVolumeStats(beginningOfDay, new Date(endOfPeriod)),
    beginningOfWeek && getSwapVolumeStats(beginningOfWeek, new Date(endOfPeriod)),
  ]);

  const { data, opts } = getNextJobData();
  const jobs = [
    // Schedule the next job
    { name, data, opts } as const,
    buildMessageData({ stats: dailyVolume, date: beginningOfDay, channel: 'telegram' }),
    buildMessageData({ stats: dailyVolume, date: beginningOfDay, channel: 'discord' }),
  ];

  if (maybeWeeklyVolume) {
    const opts = { stats: maybeWeeklyVolume, date: beginningOfDay, isDaily: false };
    jobs.push(
      buildMessageData({ ...opts, channel: 'telegram' }),
      buildMessageData({ ...opts, channel: 'discord' }),
    );
  }

  await dispatchJobs(jobs);
};

const initialize: Initializer<typeof name> = async (queue) => {
  const { data, opts } = getNextJobData();
  await queue.add(name, data, opts);
};

export const config: JobConfig<typeof name> = {
  name,
  initialize,
  processJob,
};
