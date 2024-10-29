import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';

const name = 'scheduler';
type Name = typeof name;

type Data = DispatchJobArgs[];

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<Name> = (dispatchJobs) => (job) => dispatchJobs(job.data);

export const config: JobConfig<Name> = {
  name,
  processJob,
};
