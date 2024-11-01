import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Bold } from '../channels/formatting.js';
import checkForFirstNewLpDeposits, {
  getLatestDepositId,
  NewDeposit,
} from '../queries/liquidityDeposits.js';
import { abbreviate, formatUsdValue } from '../utils/strings.js';

const name = 'newLpDepositCheck';
type Name = typeof name;

type Data = {
  lastCheckedDepositId: number;
};
declare global {
  interface JobData {
    [name]: Data;
  }
}

const INTERVAL = 30_000;

const getNextJobData = (depositId: number): Extract<DispatchJobArgs, { name: Name }> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newLpDepositCheck';

  return {
    name,
    data: { lastCheckedDepositId: depositId },
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

const buildMessage = ({
  channel,
  deposit,
}: {
  channel: 'discord' | 'telegram';
  deposit: NewDeposit;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }> => {
  const message = renderToStaticMarkup(
    <>
      {`💸 New Liquidity Provider Detected!\n`}
      <Bold channel={channel}>{abbreviate(deposit.lpIdSs58)}</Bold> deposited{' '}
      {deposit.depositAmount} {deposit.asset.toUpperCase()} (
      {formatUsdValue(deposit.depositValueUsd)}) 🍾
    </>,
  );

  return {
    name: 'messageRouter' as const,
    data: {
      messageType: 'NEW_LP',
      channel,
      message,
    },
  };
};

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const latestDepositId = await getLatestDepositId();
  const { name, data, opts } = getNextJobData(latestDepositId);

  const { lastCheckedDepositId } = job.data;
  const firstLpDeposits = await checkForFirstNewLpDeposits(lastCheckedDepositId);

  const scheduler = { name: 'scheduler', data: [{ name, data, opts }] } as const;
  const jobs = [scheduler] as DispatchJobArgs[];

  if (firstLpDeposits.length) {
    firstLpDeposits.forEach((deposit) => {
      jobs.push(buildMessage({ channel: 'telegram', deposit }));
      jobs.push(buildMessage({ channel: 'discord', deposit }));
    });
  }

  await dispatchJobs(jobs);
};

const initialize: Initializer<Name> = async (queue) => {
  const latestDepositId = await getLatestDepositId();

  const { data, opts } = getNextJobData(latestDepositId);
  await queue.add(name, data, opts);
};

export const config: JobConfig<Name> = {
  name,
  initialize,
  processJob,
};