import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Bold } from '../channels/formatting.js';
import checkForFirstNewLpDeposits, {
  getLatestDepositId,
  NewDeposit,
} from '../queries/liquidityDeposits.js';
import { abbreviate } from '../utils/strings.js';
import { formatUsdValue } from '../utils.js';

const name = 'newLpDepositCheck';
type Name = typeof name;

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

type Data = {
  lastCheckedDepositId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const buildMessage = ({
  channel,
  deposit,
}: {
  channel: 'discord' | 'telegram';
  deposit: NewDeposit;
}) => {
  const message = renderToStaticMarkup(
    <>
      {`💸 New Liquidity Provider Detected!\n`}
      <Bold channel={channel}>{abbreviate(deposit.lpIdSs58)}</Bold> deposited{' '}
      {deposit.depositAmount} {deposit.asset.toUpperCase()} (
      {formatUsdValue(deposit.depositValueUsd)}) 🍾
    </>,
  );

  return {
    name: 'messages' as const,
    data: {
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
  const jobs = [scheduler] as [typeof scheduler | ReturnType<typeof buildMessage>];

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
