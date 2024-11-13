import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import getLatestSwapRequestId from '../queries/getLatestSwapRequestId.js';
import getNewSwapRequests from '../queries/getNewSwapRequests.js';
import logger from '../utils/logger.js';

const name = 'newSwapCheck';
type Name = typeof name;

const INTERVAL = 30_000;

export const getNextJobData = async (
  swapRequestId: string | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newSwapCheck';

  return {
    name: 'scheduler',
    data: [
      { name, data: { lastSwapRequestId: swapRequestId ?? (await getLatestSwapRequestId()) } },
    ],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

type Data = {
  lastSwapRequestId: string;
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

  const swapRequestJobs = newSwapRequests.map((id) => ({
    name: 'swapStatusCheck' as const,
    data: { swapRequestId: id },
  }));

  const latestSwapRequestId = newSwapRequests
    .map((id) => BigInt(id))
    .reduce((a, b) => (a > b ? a : b), BigInt(job.data.lastSwapRequestId));
  logger.info(`Current latest swapRequestId: ${latestSwapRequestId}`);

  const data = await getNextJobData(latestSwapRequestId.toString());

  await dispatchJobs([data, ...swapRequestJobs]);

  logger.info({ newSwapRequests }, `Found ${newSwapRequests.length} new swap requests`);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
