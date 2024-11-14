import type { DispatchJobArgs, Initializer, JobConfig, JobProcessor } from './initialize.js';
import { getNextJobData as getNextBurnJobData } from './newBurnCheck.js';
import { getNextJobData as getNextLpCheckJobData } from './newLpDepositCheck.js';
import { getNextJobData as getNextSwapCheckJobData } from './newSwapCheck.js';
import { getNextJobData as getNextTimePeriodJobData } from './timePeriodStats.js';

const name = 'scheduler';
type Name = typeof name;

type Data = DispatchJobArgs[] | readonly DispatchJobArgs[];

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<Name> = (dispatchJobs) => (job) =>
  dispatchJobs(job.data.filter((data) => data.name !== 'scheduler'));

const initialize: Initializer<Name> = async (queue) => {
  const timePeriodJob = getNextTimePeriodJobData();
  const jobs = await Promise.all([
    getNextSwapCheckJobData(null),
    getNextLpCheckJobData(null),
    getNextBurnJobData(null),
  ]);

  await queue.addBulk([timePeriodJob, ...jobs]);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
  initialize,
};
