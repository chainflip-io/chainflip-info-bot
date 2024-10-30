import { utc } from '@date-fns/utc';
import { JobsOptions, UnrecoverableError } from 'bullmq';
import { endOfToday, endOfWeek, hoursToMilliseconds, startOfDay, startOfWeek } from 'date-fns';
import { Fragment } from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Bold } from '../channels/formatting.js';
import getLpFills, { LPFillsData } from '../queries/lpFills.js';
import getSwapVolumeStats, { SwapStats } from '../queries/swapVolume.js';
import { abbreviate } from '../utils/strings.js';
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
  const customJobId = `timePeriodStats-${endOfPeriod}`;

  return {
    data: {
      endOfPeriod,
      sendWeeklySummary:
        endOfPeriod === endOfWeek(endOfPeriod, { weekStartsOn: 1, in: utc }).valueOf(),
    },
    opts: { delay: endOfPeriod - Date.now(), deduplication: { id: customJobId } },
  };
};

const buildMessageData = ({
  stats,
  date,
  isDaily = true,
  channel,
}: {
  stats: SwapStats | LPFillsData[];
  date: Date;
  isDaily?: boolean;
  channel: 'discord' | 'telegram';
}) => {
  let message = '';

  if (stats && 'swapVolume' in stats) {
    message = renderToStaticMarkup(
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
    );
  }
  if (Array.isArray(stats) && 'filledAmountValueUsd' in stats[0]) {
    const medals = ['🥇', '🥈', '🥉', '💫', '💫'];
    message = renderToStaticMarkup(
      <>
        {isDaily
          ? `💼 Top LPs for ${date.toISOString().slice(0, 10)} are in \n`
          : '💼 Top LPs for the week are in '}
        {stats.map(
          (stat, index) =>
            stat.filledAmountValueUsd.gt(0) && (
              <Fragment key={stat.idSs58}>
                <Bold channel={channel}>
                  {medals[index]} {formatUsdValue(stats.at(0)?.filledAmountValueUsd)}
                </Bold>{' '}
                {abbreviate(stat.idSs58)} ({stat.percentage}%)
                {'\n'}
              </Fragment>
            ),
        )}
      </>,
    );
  }

  return {
    name: 'messages' as const,
    data: {
      channel,
      message,
    },
  };
};

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

  const [dailyVolume, maybeWeeklyVolume, dailyLpFills, maybeWeeklyLpFills] = await Promise.all([
    getSwapVolumeStats(beginningOfDay, new Date(endOfPeriod)),
    beginningOfWeek && getSwapVolumeStats(beginningOfWeek, new Date(endOfPeriod)),
    getLpFills({ start: beginningOfDay.toISOString(), end: new Date(endOfPeriod).toISOString() }),
    beginningOfWeek &&
      getLpFills({
        start: beginningOfWeek.toISOString(),
        end: new Date(endOfPeriod).toISOString(),
      }),
  ]);

  const { data, opts } = getNextJobData();
  const jobs = [
    // Schedule the next job
    { name: 'scheduler', data: [{ name, data, opts }] } as const,
    buildMessageData({ stats: dailyVolume, date: beginningOfDay, channel: 'telegram' }),
    buildMessageData({ stats: dailyVolume, date: beginningOfDay, channel: 'discord' }),
    buildMessageData({ stats: dailyLpFills, date: beginningOfDay, channel: 'telegram' }),
    buildMessageData({ stats: dailyLpFills, date: beginningOfDay, channel: 'discord' }),
  ];

  if (maybeWeeklyVolume && maybeWeeklyLpFills) {
    const volumeOpts = { stats: maybeWeeklyVolume, date: beginningOfDay, isDaily: false };
    const lpFillsOpts = { stats: maybeWeeklyLpFills, date: beginningOfDay, isDaily: false };

    jobs.push(
      buildMessageData({ ...volumeOpts, channel: 'telegram' }),
      buildMessageData({ ...volumeOpts, channel: 'discord' }),
      buildMessageData({ ...lpFillsOpts, channel: 'telegram' }),
      buildMessageData({ ...lpFillsOpts, channel: 'discord' }),
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
