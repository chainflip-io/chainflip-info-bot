import { isNotNullish } from '@chainflip/utils/guard';
import { abbreviate } from '@chainflip/utils/string';
import { subHours } from 'date-fns';
import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import { Bold, ExplorerLink, Line, renderForPlatform, Trailer } from '../channels/formatting.js';
import { platforms } from '../config.js';
import getBoundaryLiquidationSwapRequestId from '../queries/getBoundaryLiquidationSwapRequestId.js';
import getLatestLiquidationSwapRequestId from '../queries/getLatestLiquidationSwapRequestId.js';
import getNewLiquidationSwapRequests from '../queries/getNewLiquidationSwapRequests.js';
import logger from '../utils/logger.js';

const name = 'newLiquidationCheck';
type Name = typeof name;

type Data = {
  lastCheckedLiquidationSwapRequestId: `${number}`;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const INTERVAL = 30_000;

export const getNextJobData = async (
  liquidationSwapRequestId: `${number}` | null,
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
          <Line>👀 Liquidation initiated</Line>
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
            <Bold>
              {loanIds.map((loanId, i) => (
                <>
                  <ExplorerLink key={loanId} path={`/loans/${loanId}`} prefer="link">
                    #{loanId}
                  </ExplorerLink>
                  {i !== loanIds.length - 1 && ', '}
                </>
              ))}
            </Bold>
          </Line>
          <Line>
            🔄 Liquidation swaps:{' '}
            <Bold>
              {swapRequestIds.map((swapRequestId, i) => (
                <>
                  <ExplorerLink key={swapRequestId} path={`/swaps/${swapRequestId}`} prefer="link">
                    #{swapRequestId}
                  </ExplorerLink>
                  {i !== swapRequestIds.length - 1 && ', '}
                </>
              ))}
            </Bold>
          </Line>
          <Trailer />
        </>,
      ).trimEnd(),
      filterData: { name: 'LIQUIDATION_INITIATED' },
    },
  }));

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info('Checking for new liquidation swap requests', job.data);
  const minTimestamp = subHours(new Date(), 12).toISOString();
  const currentSwapRequestId = job.data.lastCheckedLiquidationSwapRequestId;
  const swapRequests = await getNewLiquidationSwapRequests(currentSwapRequestId, minTimestamp);

  const boundarySwapRequestId = await getBoundaryLiquidationSwapRequestId(minTimestamp);

  const latestSwapRequestId = swapRequests.length
    ? `${Math.max(...swapRequests.map((request) => Number(request.swapRequestId)))}`
    : `${Math.max(Number(boundarySwapRequestId ?? currentSwapRequestId), Number(currentSwapRequestId))}`;

  logger.info(
    `Latest liquidation swap request id: ${latestSwapRequestId}, found ${swapRequests.length} new liquidation swap requests for last 12h`,
  );

  const jobs: DispatchJobArgs[] = [await getNextJobData(latestSwapRequestId as `${number}`)];

  // Boost loans should never have liquidation swaps, so every request is expected to have a
  // borrower account. Skip any that don't rather than failing the job, so the checkpoint still
  // advances and the pipeline keeps running.
  const validRequests = swapRequests.filter((request) =>
    isNotNullish(request.loanByLoanId.accountByBorrowerId?.idSs58),
  );

  if (validRequests.length !== swapRequests.length) {
    logger.warn(
      `Skipping ${swapRequests.length - validRequests.length} liquidation swap request(s) with no borrower account`,
    );
  }

  if (validRequests.length) {
    const grouped = Map.groupBy(
      validRequests,
      (request) =>
        `${request.loanByLoanId.accountByBorrowerId!.idSs58}-${request.createdAtEventId}`,
    );

    for (const [key, groupedSwapRequests] of grouped) {
      const [borrowerIdSs58] = key.split('-');

      const loanIds = [...new Set(groupedSwapRequests.map((item) => item.loanByLoanId.id))];
      const swapRequestIds = groupedSwapRequests.map((item) => item.swapRequestId);

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
              jobCreatedAt: Date.now(),
              deduplicationId: `liquidation-status-${key}`,
            },
          },
        ],
        opts: {
          delay: INTERVAL,
          deduplication: {
            id: `liquidation-status-${key}`,
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
