import { Initializer, JobConfig, JobProcessor } from './initialize.js';

const name = 'count';

type Data = { count: number };

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<typeof name, Data> = (dispatchJob) => async (job) => {
  // eslint-disable-next-line no-console
  console.log('count:', job.data.count);

  if (job.data.count < 10) {
    await dispatchJob('count', { count: job.data.count + 1 }, { delay: 1_000 });
  } else {
    await dispatchJob('echo', { message: 'I counted to 10!' });
  }
};

const initialize: Initializer<typeof name, Data> = async (queue) => {
  const jobCount = await queue.count();

  if (jobCount === 0) {
    await queue.add(name, { count: 0 }, { delay: 1_000 });
  }
};

export const config: JobConfig<typeof name, Data> = {
  name,
  initialize,
  processJob,
};
