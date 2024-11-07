import { toUpperCase } from '@chainflip/utils/string';
import { utc } from '@date-fns/utc';
import assert from 'assert';
import { JobsOptions, UnrecoverableError } from 'bullmq';
import { endOfToday, endOfWeek, hoursToMilliseconds, startOfDay, startOfWeek } from 'date-fns';
import { Fragment } from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Bold, ExplorerLink } from '../channels/formatting.js';
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
  period,
}: {
  stats: SwapStats | LPFillsData[];
  date: Date;
  period: 'daily' | 'weekly';
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => {
    let message = '';
    const isDaily = period === 'daily';
    let name;

    if ('swapVolume' in stats) {
      name = `${toUpperCase(period)}_SWAP_SUMMARY` as const;
      message = renderToStaticMarkup(
        <>
          🗓️ {isDaily ? 'On' : 'For the week ending'}{' '}
          <Bold platform={platform}>{date.toISOString().slice(0, 10)}</Bold>, we had:{'\n'}
          📊 <Bold platform={platform}>{formatUsdValue(stats.swapVolume)}</Bold> in total volume
          {'\n'}
          🌐 <Bold platform={platform}>{formatUsdValue(stats.networkFees)}</Bold> of network fees
          {'\n'}
          🤑 <Bold platform={platform}>{formatUsdValue(stats.lpFees)}</Bold> of LP fees
          {stats.boostFees.gt(0) && (
            <>
              {'\n'}
              ⚡️ <Bold platform={platform}>{formatUsdValue(stats.boostFees)}</Bold> of boost fees
            </>
          )}
          {stats.flipBurned && (
            <>
              {'\n'}
              🔥 <Bold platform={platform}>{stats.flipBurned.toFixed(2)}</Bold> FLIP burned
            </>
          )}
        </>,
      );
    }
    if (Array.isArray(stats)) {
      name = `${toUpperCase(period)}_LP_SUMMARY` as const;
      const youTried = '🏅';
      const medals = ['🥇', '🥈', '🥉'];
      message = renderToStaticMarkup(
        <>
          💼 Top LPs for {isDaily ? date.toISOString().slice(0, 10) : 'the week'} are in:{'\n'}
          {stats.slice(0, isDaily ? 5 : -1).map(
            (stat, index) =>
              stat.filledAmountValueUsd.gt(0) && (
                <Fragment key={stat.idSs58}>
                  {medals[index] ?? youTried}{' '}
                  {formatUsdValue(stats.at(index)?.filledAmountValueUsd)}{' '}
                  <ExplorerLink platform={platform} path={`/lps/${stat.idSs58}`}>
                    <Bold platform={platform}>{stat.alias ?? abbreviate(stat.idSs58)}</Bold>
                  </ExplorerLink>{' '}
                  ({stat.percentage}%)
                  {'\n'}
                </Fragment>
              ),
          )}
        </>,
      );
    }

    assert(name, 'name must be defined');

    return {
      name: 'messageRouter' as const,
      data: {
        platform,
        message,
        filterData: { name },
      },
    };
  });

const processJob: JobProcessor<typeof name> = (dispatchJobs) => async (job) => {
  logger.info(job.data, 'Processing time period stats');
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
  const jobs = [
    // Schedule the next job
    { name: 'scheduler', data: [{ name, data, opts }] } as const,
    ...buildMessages({ stats: dailyVolume, date: beginningOfDay, period: 'daily' }),
    ...buildMessages({ stats: dailyLpFills, date: beginningOfDay, period: 'daily' }),
  ];

  if (maybeWeeklyVolume && maybeWeeklyLpFills) {
    jobs.push(
      ...buildMessages({ stats: maybeWeeklyVolume, date: beginningOfDay, period: 'weekly' }),
      ...buildMessages({ stats: maybeWeeklyLpFills, date: beginningOfDay, period: 'weekly' }),
    );
  }

  await dispatchJobs(jobs);

  logger.info({ newJobs: jobs.length, newData: data }, 'Processed time period stats');
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
