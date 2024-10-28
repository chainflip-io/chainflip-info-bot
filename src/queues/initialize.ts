import { JobsOptions, Processor, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config as messageConfig } from './messages.js';
import { config as timePeriodStatsConfig } from './timePeriodStats.js';
import env from '../env.js';
import { handleExit } from '../utils.js';

const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

handleExit(async () => {
  await redis.quit();
});

type DispatchJobs = <K extends keyof JobData>(
  name: K,
  args: { data: JobData[K]; opts?: JobsOptions }[],
) => Promise<void>;

export type JobProcessor<N extends string, T> = (
  dispatchJobs: DispatchJobs,
) => Processor<T, void, N>;

export type Initializer<N extends string, T> = (queue: Queue<T, void, N>) => Promise<void>;

export type JobConfig<N extends string, T> = {
  name: N;
  initialize?: Initializer<N, T>;
  processJob: JobProcessor<N, T>;
};

const createQueue = async <N extends string, T>(
  dispatchJobs: DispatchJobs,
  { name, initialize, processJob }: JobConfig<N, T>,
) => {
  const queue = new Queue<T, void, N>(name, { connection: redis });

  await initialize?.(queue);

  const worker = new Worker<T, void, N>(name, processJob(dispatchJobs), {
    connection: redis,
  });

  handleExit(async () => {
    await Promise.allSettled([worker.close(), queue.close()]);
  });

  return queue;
};

export const initialize = async () => {
  const queues = {} as { [K in keyof JobData]: Queue<JobData[K], void, K> };

  const dispatchJobs: DispatchJobs = async (name, jobArgs) => {
    try {
      await queues[name].addBulk(jobArgs.map(({ data, opts }) => ({ name, data, opts })));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  };

  queues.messages = await createQueue(dispatchJobs, messageConfig);
  queues['time-period-stats'] = await createQueue(dispatchJobs, timePeriodStatsConfig);

  return Object.values(queues);
};
