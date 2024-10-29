import { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import getLatestSwapRequestId from '../queries/getLatestSwapRequestId.js';
import getNewSwapRequests from '../queries/getNewSwapRequests.js';

const name = 'newSwapCheck';
type Name = typeof name;

const INTERVAL = 30_000;

const getNextJobData = (swapRequestId: string): Extract<DispatchJobArgs, { name: Name }> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = `newSwapCheck-${swapRequestId}`;

  return {
    name,
    data: { lastSwapRequestId: swapRequestId },
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
  const newSwapRequests = await getNewSwapRequests(job.data.lastSwapRequestId);

  // TODO: enqueue jobs for each new swap request

  const latestSwapRequestId = newSwapRequests
    .map((id) => BigInt(id))
    .reduce((a, b) => (a > b ? a : b), BigInt(job.data.lastSwapRequestId));

  const data = getNextJobData(latestSwapRequestId.toString());
  await dispatchJobs([{ name: 'scheduler', data: [data] }]);
};

const initialize: Initializer<Name> = async (queue) => {
  const latestSwapRequestId = await getLatestSwapRequestId();
  const { data, opts } = getNextJobData(latestSwapRequestId);
  await queue.add(name, data, opts);
};

export const config: JobConfig<Name> = {
  name,
  initialize,
  processJob,
};
