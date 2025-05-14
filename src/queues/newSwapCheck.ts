import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import getLatestSwapRequestId from '../queries/getLatestSwapRequestId.js';
import getNewSwapRequests from '../queries/getNewSwapRequests.js';
import logger from '../utils/logger.js';

const name = 'newSwapCheck';
type Name = typeof name;

const INTERVAL = 30_000;

export const getNextJobData = async (
  swapRequestId: `${number}` | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newSwapCheck';

  return {
    name: 'scheduler',
    data: [
      {
        name,
        data: { lastSwapRequestId: swapRequestId ?? (await getLatestSwapRequestId()) },
        opts: { attempts: 720, backoff: { delay: 5_000, type: 'fixed' } },
      },
    ],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

type Data = {
  lastSwapRequestId: `${number}`;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(
    `Checking for new swap requests, lastSwapRequestId: ${job.data.lastSwapRequestId}`,
    job.data,
  );
  const newSwapRequests = await getNewSwapRequests(job.data.lastSwapRequestId);

  const swapRequestJobs = newSwapRequests.flatMap((id) => [
    { name: 'swapStatusCheck' as const, data: { swapRequestId: id } },
    { name: 'newSwapAlert' as const, data: { swapRequestId: id } },
  ]);

  const latestSwapRequestId = newSwapRequests
    .map((id) => BigInt(id))
    .reduce((a, b) => (a > b ? a : b), BigInt(job.data.lastSwapRequestId));
  logger.info(`Current latest swapRequestId: ${latestSwapRequestId}`);

  const data = await getNextJobData(latestSwapRequestId.toString() as `${number}`);

  await dispatchJobs([data, ...swapRequestJobs]);

  logger.info({ newSwapRequests }, `Found ${newSwapRequests.length} new swap requests`);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
