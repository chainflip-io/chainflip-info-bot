import { abbreviate } from '@chainflip/utils/string';
import { hoursToMilliseconds } from 'date-fns';
import { Bold, ExplorerLink, Line, renderForPlatform, Trailer } from '../channels/formatting.js';
import { platforms } from '../config.js';
import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import getLiquidationStatus from '../queries/getLiquidationStatus.js';
import logger from '../utils/logger.js';

const INTERVAL = 30_000;
const LIQUIDATION_AGE_THRESHOLD = hoursToMilliseconds(6);
const INTERVAL_AFTER_THRESHOLD = hoursToMilliseconds(1);

const name = 'liquidationStatusCheck';
type Name = typeof name;

type Data = {
  loanIds: `${number}`[];
  swapRequestIds: `${number}`[];
  borrowerIdSs58: string;
  createdAt: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const buildMessages = ({
  borrowerIdSs58,
  swapRequestIds,
  loanIds,
}: {
  borrowerIdSs58: string;
  swapRequestIds: `${number}`[];
  loanIds: `${number}`[];
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] =>
  platforms.map((platform) => ({
    name: 'messageRouter' as const,
    data: {
      platform,
      message: renderForPlatform(
        platform,
        <>
          <Line>Liquidation completed</Line>
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
      filterData: { name: 'LIQUIDATION_COMPLETED' },
    },
  }));

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const { loanIds, swapRequestIds, borrowerIdSs58 } = job.data;
  logger.info(`Checking liquidation status for account ${borrowerIdSs58}`);

  const statuses = await getLiquidationStatus(loanIds);
  if (!statuses) return;
  const isLiquidationCompleted = statuses.every((status) => status.isCompleted);

  if (!isLiquidationCompleted) {
    logger.info(
      `Liquidation for account ${borrowerIdSs58} is not completed, reschedule status check`,
    );
    await dispatchJobs([
      {
        name: 'scheduler',
        data: [
          {
            name,
            data: { loanIds, swapRequestIds, borrowerIdSs58, createdAt: job.data.createdAt },
          },
        ],
        opts: {
          delay:
            Date.now() - job.data.createdAt >= LIQUIDATION_AGE_THRESHOLD
              ? INTERVAL_AFTER_THRESHOLD
              : INTERVAL,
        },
      } as const,
    ]);
    return;
  }

  await dispatchJobs(buildMessages({ borrowerIdSs58, swapRequestIds, loanIds }));
  logger.info(`Sent message, liquidation for account ${borrowerIdSs58} is completed`);
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
