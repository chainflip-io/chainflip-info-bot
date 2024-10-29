import { FlowProducer, JobsOptions, Processor, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config as messageConfig } from './messages.js';
import { config as timePeriodStatsConfig } from './timePeriodStats.js';
import env from '../env.js';
import { handleExit } from '../utils.js';

const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

handleExit(async () => {
  await redis.quit();
});

type JobName = keyof JobData;

type DispatchJobArgs = {
  [N in JobName]: { name: N; data: JobData[N]; opts?: JobsOptions };
}[JobName];

type DispatchJobs = (args: DispatchJobArgs[]) => Promise<void>;

export type JobProcessor<N extends JobName> = (
  dispatchJobs: DispatchJobs,
) => Processor<JobData[N], void, N>;

export type Initializer<N extends JobName> = (queue: Queue<JobData[N], void, N>) => Promise<void>;

export type JobConfig<N extends JobName> = {
  name: N;
  initialize?: Initializer<N>;
  processJob: JobProcessor<N>;
};

const createQueue = async <N extends JobName>(
  dispatchJobs: DispatchJobs,
  { name, initialize, processJob }: JobConfig<N>,
) => {
  const queue = new Queue<JobData[N], void, N>(name, { connection: redis });

  await initialize?.(queue);

  const worker = new Worker<JobData[N], void, N>(name, processJob(dispatchJobs), {
    connection: redis,
  });

  handleExit(async () => {
    await Promise.allSettled([worker.close(), queue.close()]);
  });

  return queue;
};

export const initialize = async () => {
  const queues = {} as { [K in keyof JobData]: Queue<JobData[K], void, K> };

  const flow = new FlowProducer({ connection: redis });

  handleExit(async () => {
    await flow.close();
  });

  const dispatchJobs: DispatchJobs = async (jobArgs) => {
    try {
      await flow.addBulk(
        jobArgs.map(({ name, data, opts }) => ({ queueName: name, name, data, opts })),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  };

  queues.messages = await createQueue(dispatchJobs, messageConfig);
  queues.timePeriodStats = await createQueue(dispatchJobs, timePeriodStatsConfig);

  return Object.values(queues);
};
