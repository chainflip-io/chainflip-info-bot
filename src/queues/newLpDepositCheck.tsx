import { renderToStaticMarkup } from 'react-dom/server';
import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { Bold } from '../channels/formatting.js';
import { platforms } from '../config.js';
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

const buildMessages = ({
  deposit,
}: {
  deposit: NewDeposit;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => {
    const message = renderToStaticMarkup(
      <>
        {`💸 New Liquidity Provider Detected!\n`}
        <Bold platform={platform}>{abbreviate(deposit.lpIdSs58)}</Bold> deposited{' '}
        {deposit.depositAmount} {deposit.asset.toUpperCase()} (
        {formatUsdValue(deposit.depositValueUsd)}) 🍾
      </>,
    );

    return {
      name: 'messageRouter' as const,
      data: {
        validationData: { name: 'NEW_LP' },
        platform,
        message,
      },
    };
  });

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const latestDepositId = await getLatestDepositId();
  const { name, data, opts } = getNextJobData(latestDepositId);

  const { lastCheckedDepositId } = job.data;
  const firstLpDeposits = await checkForFirstNewLpDeposits(lastCheckedDepositId);

  const scheduler = { name: 'scheduler', data: [{ name, data, opts }] } as const;
  const jobs = [
    scheduler,
    ...firstLpDeposits.flatMap((deposit) => buildMessages({ deposit })),
  ] as DispatchJobArgs[];

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
