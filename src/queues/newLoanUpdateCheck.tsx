import { ChainflipAsset } from '@chainflip/utils/chainflip';
import { abbreviate } from '@chainflip/utils/string';
import BigNumber from 'bignumber.js';
import { hoursToMilliseconds } from 'date-fns';
import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import {
  Bold,
  ExplorerLink,
  Line,
  renderForPlatform,
  TokenAmount,
  Trailer,
  UsdValue,
} from '../channels/formatting.js';
import { platforms } from '../config.js';
import { LoanUpdateType } from '../graphql/generated/lp/graphql.js';
import getLatestLoanUpdateId from '../queries/getLatestLoanUpdateId.js';
import getNewLoanUpdate from '../queries/getNewLoanUpdate.js';

const name = 'newLoanUpdateCheck';
type Name = typeof name;

type Data = {
  lastCheckedLoanUpdateId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const INTERVAL = 30_000;

export const getNextJobData = async (
  loanUpdateId: number | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newLoanUpdateCheck';

  return {
    name: 'scheduler',
    data: [
      {
        name,
        data: { lastCheckedLoanUpdateId: loanUpdateId ?? (await getLatestLoanUpdateId()) },
        opts: { attempts: 720, backoff: { delay: 5_000, type: 'fixed' } },
      },
    ],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

const buildMessages = ({
  loanId,
  type,
  amount,
  amountValueUsd,
  asset,
  borrowerIdSs58,
}: {
  loanId: string | number;
  type: LoanUpdateType;
  amount: BigNumber;
  amountValueUsd: BigNumber;
  asset: Exclude<ChainflipAsset, 'Dot'>;
  borrowerIdSs58: string;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] => {
  const typeValue = type === 'BORROWING' ? 'Borrow' : 'Repayment';
  const filterName = type === 'BORROWING' ? 'NEW_BORROW' : 'NEW_REPAYMENT';

  return platforms.map((platform) => ({
    name: 'messageRouter' as const,
    data: {
      platform,
      message: renderForPlatform(
        platform,
        <>
          <Line>
            🏦 Loan{' '}
            <Bold>
              <ExplorerLink path={`/loans/${loanId}`} prefer="link">
                #{loanId.toString()}
              </ExplorerLink>
            </Bold>
          </Line>
          <Line>
            👤 Account:{' '}
            <Bold>
              <ExplorerLink path={`/lps/${borrowerIdSs58}`} prefer="link">
                {abbreviate(borrowerIdSs58, 8)}
              </ExplorerLink>
            </Bold>
          </Line>
          <Line>
            💳 Type: <Bold>{typeValue}</Bold>
          </Line>
          <Line>
            📥 Amount:{' '}
            <Bold>
              <TokenAmount amount={amount} asset={asset} />
            </Bold>
            <UsdValue amount={amountValueUsd} />
          </Line>
          <Trailer />
        </>,
      ).trimEnd(),
      filterData: { name: filterName },
    },
  }));
};

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const loanUpdate = await getNewLoanUpdate(job.data.lastCheckedLoanUpdateId);

  const jobs: DispatchJobArgs[] = [
    await getNextJobData(loanUpdate?.id ?? job.data.lastCheckedLoanUpdateId),
  ];

  if (loanUpdate) {
    const { type, amount, amountValueUsd, loanByLoanId, timestamp } = loanUpdate;

    // We just want to send the message if the loan update happened in the last 12 hours
    if (Date.now() - new Date(timestamp).getTime() <= hoursToMilliseconds(12)) {
      jobs.push(
        ...buildMessages({
          loanId: loanByLoanId.id,
          type,
          amount,
          amountValueUsd,
          asset: loanByLoanId.asset as Exclude<ChainflipAsset, 'Dot'>,
          borrowerIdSs58: loanByLoanId.accountByBorrowerId.idSs58,
        }),
      );
    }
  }

  await dispatchJobs(jobs);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
