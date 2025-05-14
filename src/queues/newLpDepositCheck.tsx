import { abbreviate } from '@chainflip/utils/string';
import { hoursToMilliseconds } from 'date-fns/hoursToMilliseconds';
import { renderToStaticMarkup } from 'react-dom/server';
import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import { Bold, ExplorerLink, Line, Trailer } from '../channels/formatting.js';
import { platforms } from '../config.js';
import { humanFriendlyAsset } from '../consts.js';
import checkForFirstNewLpDeposits, {
  getLatestDepositId,
  type NewDeposit,
} from '../queries/liquidityDeposits.js';
import { formatUsdValue } from '../utils/functions.js';

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

export const getNextJobData = async (
  depositId: number | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newLpDepositCheck';

  return {
    name: 'scheduler',
    data: [
      {
        name,
        data: { lastCheckedDepositId: depositId ?? (await getLatestDepositId()) },
        opts: { attempts: 720, backoff: { delay: 5_000, type: 'fixed' } },
      },
    ],
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
        <Line>💸 New Liquidity Provider Detected!</Line>
        <Line>
          <Bold platform={platform}>{abbreviate(deposit.lpIdSs58)}</Bold> deposited{' '}
          {deposit.depositAmount} {humanFriendlyAsset[deposit.asset]} (
          {formatUsdValue(deposit.depositValueUsd)}) 🍾
        </Line>
        <Line>
          <ExplorerLink path={`/lps/${deposit.lpIdSs58}`} platform={platform} prefer="link">
            View on explorer
          </ExplorerLink>
        </Line>
        <Trailer platform={platform} />
      </>,
    ).trimEnd();

    return {
      name: 'messageRouter' as const,
      data: {
        filterData: { name: 'NEW_LP' },
        platform,
        message,
      },
    };
  });

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const { lastCheckedDepositId } = job.data;
  const [latestDepositId, firstLpDeposits] = await Promise.all([
    getLatestDepositId(),
    checkForFirstNewLpDeposits(lastCheckedDepositId),
  ]);

  const jobs = [
    await getNextJobData(latestDepositId),
    ...firstLpDeposits.flatMap((deposit) =>
      // ignore messages that are longer than 12 hours old
      Date.now() - new Date(deposit.timestamp).getTime() <= hoursToMilliseconds(12)
        ? buildMessages({ deposit })
        : [],
    ),
  ] as DispatchJobArgs[];

  await dispatchJobs(jobs);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
