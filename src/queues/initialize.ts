import { FlowProducer, type JobsOptions, type Processor, Queue, QueueEvents, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config as messageRouterConfig } from './messageRouter.js';
import { config as newBurnCheckConfig } from './newBurnCheck.js';
import { config as newSwapCheckConfig } from './newSwapCheck.js';
import { config as schedulerConfig } from './scheduler.js';
import { config as sendMessageConfig } from './sendMessage.js';
import { config as swapStatusCheckConfig } from './swapStatusCheck.js';
import { config as timePeriodStatsConfig } from './timePeriodStats.js';
import env from '../env.js';
import { config as newLpDepositCheck } from './newLpDepositCheck.js';
import { handleExit, logRejections } from '../utils/functions.js';
import logger from '../utils/logger.js';

const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

// we want to ensure that the bullmq queues, workers, and flows are closed in
// the reverse order that they are created to ensure that any in progress jobs
// can complete and perform any necessary scheduling before exiting
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

export type DispatchJobs = (args: DispatchJobArgs[] | readonly DispatchJobArgs[]) => Promise<void>;

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

  const events = new QueueEvents(name, { connection: redis });

  events.on('deduplicated', (info) => {
    logger.error(info, 'deduplicated');
  });

  events.on('error', (error) => {
    logger.error({ error, queue: name }, 'error in queue');
  });

  const worker = new Worker<JobData[N], void, N>(
    name,
    logRejections(name, processJob(dispatchJobs)),
    {
      connection: redis,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    },
  );

  cleanup.push(async () => {
    await queue.close();
    await events.close();
    await worker.close();
  });

  return queue;
};

export type QueueMap = {
  [K in keyof JobData]: Queue<JobData[K], void, K>;
};

export const initialize = async () => {
  const queues = {} as QueueMap;

  const flow = new FlowProducer({ connection: redis });

  cleanup.push(() => flow.close().catch(() => null));

  const retryOpts: JobsOptions = {
    attempts: 5,
    backoff: {
      delay: 1000,
      type: 'exponential',
    },
  };

  const dispatchJobs: DispatchJobs = async (jobArgs) => {
    try {
      await flow.addBulk(
        jobArgs.map(({ name, data, opts }) => ({
          queueName: name,
          name,
          data,
          opts: { ...retryOpts, ...opts },
        })),
      );
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  queues.sendMessage = await createQueue(dispatchJobs, sendMessageConfig);
  queues.messageRouter = await createQueue(dispatchJobs, messageRouterConfig);
  queues.timePeriodStats = await createQueue(dispatchJobs, timePeriodStatsConfig);
  queues.newSwapCheck = await createQueue(dispatchJobs, newSwapCheckConfig);
  queues.newBurnCheck = await createQueue(dispatchJobs, newBurnCheckConfig);
  queues.newLpDepositCheck = await createQueue(dispatchJobs, newLpDepositCheck);
  queues.swapStatusCheck = await createQueue(dispatchJobs, swapStatusCheckConfig);
  // this queue should be shut down first
  queues.scheduler = await createQueue(dispatchJobs, schedulerConfig);

  return queues;
};
