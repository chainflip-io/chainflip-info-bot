import { utc } from '@date-fns/utc';
import { JobsOptions, UnrecoverableError } from 'bullmq';
import { endOfToday, endOfWeek, hoursToMilliseconds, startOfDay, startOfWeek } from 'date-fns';
import { Fragment } from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Bold } from '../channels/formatting.js';
import { platforms } from '../config.js';
import getLpFills, { LPFillsData } from '../queries/lpFills.js';
import getSwapVolumeStats, { SwapStats } from '../queries/swapVolume.js';
import logger from '../utils/logger.js';
import { abbreviate, formatUsdValue } from '../utils/strings.js';

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

const buildMessages = ({
  stats,
  date,
  name,
}: {
  stats: SwapStats | LPFillsData[];
  date: Date;
  name: 'DAILY_SUMMARY' | 'WEEKLY_SUMMARY';
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => {
    let message = '';
    const isDaily = name === 'DAILY_SUMMARY';

    if (stats && 'swapVolume' in stats) {
      message = renderToStaticMarkup(
        <>
          📊 {isDaily ? 'On' : 'For the week ending'}{' '}
          <Bold platform={platform}>{date.toISOString().slice(0, 10)}</Bold>, we had a volume of{' '}
          <Bold platform={platform}>{formatUsdValue(stats.swapVolume)}</Bold> with{' '}
          <Bold platform={platform}>{formatUsdValue(stats.networkFees)}</Bold> of network fees and{' '}
          <Bold platform={platform}>{formatUsdValue(stats.lpFees)}</Bold> in LP fees.
          {stats.flipBurned && (
            <>
              {' '}
              Also, we burned <Bold platform={platform}>{stats.flipBurned.toFixed(2)}</Bold> FLIP
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
          {stats.slice(0, isDaily ? 5 : -1).map(
            (stat, index) =>
              stat.filledAmountValueUsd.gt(0) && (
                <Fragment key={stat.idSs58}>
                  <Bold platform={platform}>
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
      name: 'messageRouter' as const,
      data: {
        platform,
        message,
        validationData: { name },
      },
    };
  });

const processJob: JobProcessor<typeof name> = (dispatchJobs) => async (job) => {
  logger.info('Processing time period stats', job.data);
  const { endOfPeriod, sendWeeklySummary } = job.data;

  const timeElapsedSinceEndOfPeriod = Date.now() - endOfPeriod;

  if (timeElapsedSinceEndOfPeriod > hoursToMilliseconds(12)) {
    logger.warn('discarding stale job');
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const daily = 'DAILY_SUMMARY' as const;
  const jobs = [
    // Schedule the next job
    { name: 'scheduler', data: [{ name, data, opts }] } as const,
    ...buildMessages({ stats: dailyVolume, date: beginningOfDay, name: daily }),
    ...buildMessages({ stats: dailyLpFills, date: beginningOfDay, name: daily }),
  ];

  if (maybeWeeklyVolume && maybeWeeklyLpFills) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const weekly = 'WEEKLY_SUMMARY' as const;
    const volumeOpts = { stats: maybeWeeklyVolume, date: beginningOfDay, name: weekly };
    const lpFillsOpts = { stats: maybeWeeklyLpFills, date: beginningOfDay, name: weekly };

    jobs.push(...buildMessages(volumeOpts), ...buildMessages(lpFillsOpts));
  }

  await dispatchJobs(jobs);

  logger.info('Processed time period stats', { newJobs: jobs.length, newData: data });
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
