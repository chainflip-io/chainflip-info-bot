import { FlowProducer, JobsOptions, Processor, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config as messageRouterConfig } from './messageRouter.js';
import { config as newBurnCheckConfig } from './newBurnCheck.js';
import { config as newSwapCheckConfig } from './newSwapCheck.js';
import { config as schedulerConfig } from './scheduler.js';
import { config as sendMessageConfig } from './sendMessage.js';
import { config as timePeriodStatsConfig } from './timePeriodStats.js';
import env from '../env.js';
import { config as newLpDepositCheck } from './newLpDepositCheck.js';
import { handleExit, logRejections } from '../utils/functions.js';
import logger from '../utils/logger.js';

const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

const cleanup: (() => Promise<any>)[] = [() => redis.quit()];

handleExit(async () => {
  const handlers = cleanup.splice(0, cleanup.length).reverse();

  for (const handler of handlers) {
    await handler().catch((error) => logger.error(error));
  }
});

type JobName = keyof JobData;

export type DispatchJobArgs = {
  [N in JobName]: { name: N; data: JobData[N]; opts?: JobsOptions };
}[JobName];

type DispatchJobs = (args: DispatchJobArgs[] | readonly DispatchJobArgs[]) => Promise<void>;

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
  const queue = new Queue<JobData[N], void, N>(name, {
    connection: redis,
    defaultJobOptions: {
      attempts: 5,
      backoff: { delay: 1000, type: 'exponential' },
    },
  });

  await initialize?.(queue);

  const worker = new Worker<JobData[N], void, N>(
    name,
    logRejections(name, processJob(dispatchJobs)),
    {
      connection: redis,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    },
  );

  cleanup.push(() => queue.close());
  cleanup.push(() => worker.close());

  return queue;
};

export const initialize = async () => {
  const queues = {} as { [K in keyof JobData]: Queue<JobData[K], void, K> };

  const flow = new FlowProducer({ connection: redis });

  cleanup.push(() => flow.close().catch(() => null));

  const dispatchJobs: DispatchJobs = async (jobArgs) => {
    try {
      await flow.addBulk(
        jobArgs.map(({ name, data, opts }) => ({ queueName: name, name, data, opts })),
      );
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  queues.messageRouter = await createQueue(dispatchJobs, messageRouterConfig);
  queues.sendMessage = await createQueue(dispatchJobs, sendMessageConfig);
  queues.timePeriodStats = await createQueue(dispatchJobs, timePeriodStatsConfig);
  queues.newSwapCheck = await createQueue(dispatchJobs, newSwapCheckConfig);
  queues.newBurnCheck = await createQueue(dispatchJobs, newBurnCheckConfig);
  queues.scheduler = await createQueue(dispatchJobs, schedulerConfig);
  queues.newLpDepositCheck = await createQueue(dispatchJobs, newLpDepositCheck);

  return Object.values(queues);
};
