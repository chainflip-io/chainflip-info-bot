import { JobConfig, JobProcessor } from './initialize.js';

const name = 'echo';

type Data = { message: string };

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<typeof name, Data> = (dispatchJob) => async (job) => {
  // eslint-disable-next-line no-console
  console.log('echo:', job.data.message);

  if (job.data.message === 'I counted to 10!') {
    await dispatchJob('count', { count: 0 }, { delay: 1_000 });
  }
};

export const config: JobConfig<typeof name, Data> = {
  name,
  processJob,
};
