import { abbreviate } from '@chainflip/utils/string';
import { hoursToMilliseconds } from 'date-fns';
import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import { Bold, ExplorerLink, Line, renderForPlatform, Trailer } from '../channels/formatting.js';
import { platforms } from '../config.js';
import getLatestLiquidationSwapRequestId from '../queries/getLatestLiquidationSwapRequestId.js';
import getNewLiquidationSwapRequests from '../queries/getNewLiquidationSwapRequests.js';
import logger from '../utils/logger.js';

const name = 'newLiquidationCheck';
type Name = typeof name;

type Data = {
  lastCheckedLiquidationSwapRequestId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const INTERVAL = 30_000;

export const getNextJobData = async (
  liquidationSwapRequestId: number | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newLiquidationCheck';

  return {
    name: 'scheduler',
    data: [
      {
        name,
        data: {
          lastCheckedLiquidationSwapRequestId:
            liquidationSwapRequestId ?? (await getLatestLiquidationSwapRequestId()),
        },
        opts: { attempts: 720, backoff: { delay: 5_000, type: 'fixed' } },
      },
    ],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

const buildMessages = ({
  borrowerIdSs58,
  loanIds,
  swapRequestIds,
}: {
  borrowerIdSs58: string;
  loanIds: `${number}`[];
  swapRequestIds: `${number}`[];
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => ({
    name: 'messageRouter' as const,
    data: {
      platform,
      message: renderForPlatform(
        platform,
        <>
          <Line>Liquidation initiated</Line>
          <Line>
            👤 Account:{' '}
            <Bold>
              <ExplorerLink path={`/lps/${borrowerIdSs58}`} prefer="link">
                {abbreviate(borrowerIdSs58, 8)}
              </ExplorerLink>
            </Bold>
          </Line>
          <Line>
            🏦 Loans:{' '}
            {loanIds.map((loanId, i) => (
              <Bold key={loanId}>
                <ExplorerLink path={`/loans/${loanId}`} prefer="link">
                  #{loanId}
                </ExplorerLink>
                {i !== loanIds.length - 1 && ', '}
              </Bold>
            ))}
          </Line>
          <Line>
            🔄 Liquidation swaps:{' '}
            {swapRequestIds.map((swapRequestId, i) => (
              <Bold key={swapRequestId}>
                <ExplorerLink path={`/swaps/${swapRequestId}`} prefer="link">
                  #{swapRequestId}
                </ExplorerLink>
                {i !== swapRequestIds.length - 1 && ', '}
              </Bold>
            ))}
          </Line>
          <Trailer />
        </>,
      ).trimEnd(),
      filterData: { name: 'LIQUIDATION_INITIATED' },
    },
  }));

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info('Checking for new liquidation swap requests', job.data);
  const requests = await getNewLiquidationSwapRequests(
    job.data.lastCheckedLiquidationSwapRequestId,
  );

  const latestId = requests.length
    ? Math.max(...requests.map((request) => request.id))
    : job.data.lastCheckedLiquidationSwapRequestId;
  logger.info(
    `Latest liquidation swap request id: ${latestId}, found ${requests.length} new liquidation swap requests`,
  );

  const jobs: DispatchJobArgs[] = [await getNextJobData(latestId)];

  if (requests.length) {
    const grouped = Map.groupBy(
      requests,
      (request) => `${request.loanByLoanId.accountByBorrowerId.idSs58}-${request.createdAtEventId}`,
    );

    for (const [key, swapRequests] of grouped) {
      const [borrowerIdSs58, createdAtEventId] = key.split('-');

      const isLiquidationCompleted = swapRequests.every((swapRequest) => swapRequest.isCompleted);
      const isStaleLoanUpdates = swapRequests.every(({ loanByLoanId }) => {
        const timestamp = loanByLoanId.lastUpdatedAtTimestamp;
        return timestamp
          ? Date.now() - new Date(timestamp).getTime() > hoursToMilliseconds(12)
          : true;
      });
      const loanIds = [...new Set(swapRequests.map((item) => item.loanByLoanId.id))];
      const swapRequestIds = swapRequests.map((item) => item.swapRequestId);

      if (isLiquidationCompleted && isStaleLoanUpdates) {
        logger.info(`Liquidation process for account ${borrowerIdSs58} exceeded max age threshold`);
        continue;
      }

      jobs.push(...buildMessages({ borrowerIdSs58, loanIds, swapRequestIds }));

      jobs.push({
        name: 'scheduler' as const,
        data: [
          {
            name: 'liquidationStatusCheck' as const,
            data: {
              loanIds,
              swapRequestIds,
              borrowerIdSs58,
              createdAtEventId,
              createdAt: Date.now(),
            },
          },
        ],
        opts: {
          delay: INTERVAL,
          deduplication: {
            id: `liquidation-status-${createdAtEventId}-${loanIds.toSorted().join('-')}`,
          },
        },
      });

      logger.info(
        `Send messages and schedule liquidation status check for account ${borrowerIdSs58}`,
      );
    }
  }

  await dispatchJobs(jobs);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
