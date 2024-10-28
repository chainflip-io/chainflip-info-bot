import { JobsOptions, Processor, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config as countConfig } from './count.js';
import { config as echoConfig } from './echo.js';
import env from '../env.js';
import { handleExit } from '../utils.js';

const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

handleExit(async () => {
  await redis.quit();
});

type DispatchJob = <K extends keyof JobData>(
  name: K,
  data: JobData[K],
  opts?: JobsOptions,
) => Promise<void>;

export type JobProcessor<N extends string, T> = (dispatchJob: DispatchJob) => Processor<T, void, N>;

export type Initializer<N extends string, T> = (queue: Queue<T, void, N>) => Promise<void>;

export type JobConfig<N extends string, T> = {
  name: N;
  initialize?: Initializer<N, T>;
  processJob: JobProcessor<N, T>;
};

const createQueue = async <N extends string, T>(
  dispatchJob: DispatchJob,
  { name, initialize, processJob }: JobConfig<N, T>,
) => {
  const queue = new Queue<T, void, N>(name, { connection: redis });

  await initialize?.(queue);

  const worker = new Worker<T, void, N>(name, processJob(dispatchJob), {
    connection: redis,
  });

  handleExit(async () => {
    await Promise.allSettled([worker.close(), queue.close()]);
  });

  return queue;
};

export const initialize = async () => {
  const queues = {} as { [K in keyof JobData]: Queue<JobData[K], void, K> };

  const dispatchJob: DispatchJob = async (name, data, opts) => {
    try {
      await queues[name].add(name, data, opts);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  };

  queues.count = await createQueue(dispatchJob, countConfig);
  queues.echo = await createQueue(dispatchJob, echoConfig);

  return Object.values(queues);
};
