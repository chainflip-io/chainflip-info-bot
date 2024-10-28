import { renderToStaticMarkup } from 'react-dom/server';
import { endOfToday, endOfWeek, startOfDay, startOfWeek } from 'date-fns';
import { utc } from '@date-fns/utc';
import { Initializer, JobConfig, JobProcessor } from './initialize.js';
import getSwapVolumeStats, { SwapStats } from '../queries/swapVolume.js';
import { formatUsdValue } from '../utils.js';

const name = 'time-period-stats';

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

const buildMessage = (stats: SwapStats, date: Date, isDaily = true) =>
  renderToStaticMarkup(
    <>
      📊 {isDaily ? 'On' : 'For the week ending'} <strong>{date.toISOString().slice(0, 10)}</strong>
      , we had a volume of <strong>{formatUsdValue(stats.swapVolume)}</strong> with{' '}
      <strong>{formatUsdValue(stats.networkFees)}</strong> and{' '}
      <strong>{formatUsdValue(stats.lpFees)}</strong> in LP fees.{' '}
      {stats.flipBurned && <>Also, we burned {stats.flipBurned.toFixed(2)} FLIP tokens.</>}
    </>,
  );

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

  const dailyMessage = buildMessage(dailyVolume, beginningOfDay);
  const weeklyMessage =
    beginningOfWeek && maybeWeeklyVolume && buildMessage(maybeWeeklyVolume, beginningOfWeek, false);

  const jobs: { data: JobData['messages'] }[] = [
    { data: { channel: 'telegram', message: dailyMessage } },
    { data: { channel: 'discord', message: dailyMessage } },
  ];

  if (weeklyMessage) {
    jobs.push(
      { data: { channel: 'telegram', message: weeklyMessage } },
      { data: { channel: 'discord', message: weeklyMessage } },
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
