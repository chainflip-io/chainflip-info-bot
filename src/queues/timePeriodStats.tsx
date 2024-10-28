import { renderToStaticMarkup } from 'react-dom/server';
import { endOfToday, endOfWeek, startOfDay, startOfWeek } from 'date-fns';
import { utc } from '@date-fns/utc';
import { Initializer, JobConfig, JobProcessor } from './initialize.js';
import getSwapVolumeStats, { SwapStats } from '../queries/swapVolume.js';
import { formatUsdValue } from '../utils.js';
import { Bold } from '../channels/formatting.js';

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

const getNextJobData = () => {
  const endOfPeriod = endOfToday({ in: utc }).valueOf();

  return {
    data: {
      endOfPeriod,
      sendWeeklySummary:
        endOfPeriod === endOfWeek(endOfPeriod, { weekStartsOn: 1, in: utc }).valueOf(),
    },
    opts: { delay: endOfPeriod - Date.now() },
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
  channel,
  message: renderToStaticMarkup(
    <>
      📊 {isDaily ? 'On' : 'For the week ending'}{' '}
      <Bold channel={channel}>{date.toISOString().slice(0, 10)}</Bold>, we had a volume of{' '}
      <Bold channel={channel}>{formatUsdValue(stats.swapVolume)}</Bold> with{' '}
      <Bold channel={channel}>{formatUsdValue(stats.networkFees)}</Bold> and{' '}
      <Bold channel={channel}>{formatUsdValue(stats.lpFees)}</Bold> in LP fees.
      {stats.flipBurned && (
        <>
          {' '}
          Also, we burned <Bold channel={channel}>{stats.flipBurned.toFixed(2)}</Bold> FLIP tokens.
        </>
      )}
    </>,
  ),
});

const processJob: JobProcessor<typeof name, Data> = (dispatchJobs) => async (job) => {
  const { endOfPeriod, sendWeeklySummary } = job.data;

  // Schedule the next job
  const { data, opts } = getNextJobData();

  await dispatchJobs(name, [{ data, opts }]);

  const beginningOfDay = startOfDay(endOfPeriod, { in: utc });
  const beginningOfWeek = sendWeeklySummary
    ? startOfWeek(endOfPeriod, { weekStartsOn: 1, in: utc })
    : null;

  const [dailyVolume, maybeWeeklyVolume] = await Promise.all([
    getSwapVolumeStats(beginningOfDay, new Date(endOfPeriod)),
    beginningOfWeek && getSwapVolumeStats(beginningOfWeek, new Date(endOfPeriod)),
  ]);

  const jobs: { data: JobData['messages'] }[] = [
    { data: buildMessageData({ stats: dailyVolume, date: beginningOfDay, channel: 'telegram' }) },
    { data: buildMessageData({ stats: dailyVolume, date: beginningOfDay, channel: 'discord' }) },
  ];

  if (maybeWeeklyVolume) {
    const opts = { stats: maybeWeeklyVolume, date: beginningOfDay, isDaily: false };
    jobs.push(
      { data: buildMessageData({ ...opts, channel: 'telegram' }) },
      { data: buildMessageData({ ...opts, channel: 'discord' }) },
    );
  }

  await dispatchJobs('messages', jobs);
};

const initialize: Initializer<typeof name, Data> = async (queue) => {
  const jobCount = await queue.count();

  if (jobCount === 0) {
    const { data, opts } = getNextJobData();
    await queue.add(name, data, opts);
  }
};

export const config: JobConfig<typeof name, Data> = {
  name,
  initialize,
  processJob,
};
