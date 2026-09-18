import { FlowProducer, type JobsOptions, type Processor, Queue, QueueEvents, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config as liquidationStatusCheckConfig } from './liquidationStatusCheck.js';
import { config as messageRouterConfig } from './messageRouter.js';
import { config as newBurnCheckConfig } from './newBurnCheck.js';
import { config as newDelegationActivityConfig } from './newDelegationAcitivityCheck.js';
import { config as newLendingLiquidityChangeCheckConfig } from './newLendingLiquidityChangeCheck.js';
import { config as newLiquidationCheckConfig } from './newLiquidationCheck.js';
import { config as newLoanUpdateCheckConfig } from './newLoanUpdateCheck.js';
import { config as newLpDepositCheck } from './newLpDepositCheck.js';
import { config as newSwapAlertConfig } from './newSwapAlert.js';
import { config as newSwapCheckConfig } from './newSwapCheck.js';
import { config as schedulerConfig } from './scheduler.js';
import { config as sendMessageConfig } from './sendMessage.js';
import { config as swapStatusCheckConfig } from './swapStatusCheck.js';

import { config as timePeriodStatsConfig } from './timePeriodStats.js';
import env from '../env.js';
import { handleExit, logRejections } from '../utils/functions.js';
import logger, { inspectError } from '../utils/logger.js';

// bullmq requires `maxRetriesPerRequest: null`, which means a broken connection
// never surfaces as a command error -- commands queue up silently instead. the
// socket events below are the only signal that redis went away, so log them.
const createConnection = (label: string) => {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  connection.on('error', (err: unknown) => {
    logger.error('redis connection error', { connection: label, err: inspectError(err) });
  });

  connection.on('reconnecting', (delay: number) => {
    logger.warn('redis connection reconnecting', { connection: label, delay });
  });

  connection.on('end', () => {
    logger.warn('redis connection ended', { connection: label });
  });

  return connection;
};

const sharedConnection = createConnection('shared');

// we want to ensure that the bullmq queues, workers, and flows are closed in
// the reverse order that they are created to ensure that any in progress jobs
// can complete and perform any necessary scheduling before exiting
const cleanup: (() => Promise<any>)[] = [() => sharedConnection.quit()];

handleExit(async () => {
  const handlers = cleanup.splice(0, cleanup.length).reverse();

  for (const handler of handlers) {
    await handler().catch((error: unknown) =>
      logger.error(error instanceof Error ? error.message : String(error), { error }),
    );
  }
});

type JobName = keyof JobData;

type TypedQueue<N extends JobName> = Queue<JobData[N], void, N, JobData[N], void, N>;

export type DispatchJobArgs = {
  [N in JobName]: { name: N; data: JobData[N]; opts?: JobsOptions };
}[JobName];

export type DispatchJobs = (args: DispatchJobArgs[] | readonly DispatchJobArgs[]) => Promise<void>;

export type JobProcessor<N extends JobName> = (
  dispatchJobs: DispatchJobs,
) => Processor<JobData[N], void, N>;

export type Initializer<N extends JobName> = (queue: TypedQueue<N>) => Promise<void>;

export type JobConfig<N extends JobName> = {
  name: N;
  initialize?: Initializer<N>;
  processJob: JobProcessor<N>;
};

const createQueue = async <N extends JobName>(
  dispatchJobs: DispatchJobs,
  { name, initialize, processJob }: JobConfig<N>,
) => {
  const queue = new Queue<JobData[N], void, N, JobData[N], void, N>(name, {
    connection: sharedConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { delay: 1000, type: 'exponential' },
    },
  });

  await initialize?.(queue);

  const eventsConnection = createConnection(`${name}:events`);
  const events = new QueueEvents(name, { connection: eventsConnection });

  events.on('deduplicated', (info) => {
    logger.error('deduplicated', { info });
  });

  events.on('error', (error) => {
    logger.error('error in queue', { error, queue: name });
  });

  const workerConnection = createConnection(`${name}:worker`);
  const worker = new Worker<JobData[N], void, N>(
    name,
    logRejections(name, processJob(dispatchJobs)),
    {
      connection: workerConnection,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    },
  );

  // without these the worker can stop consuming jobs without logging anything
  worker.on('error', (error) => {
    logger.error('error in worker', { queue: name, err: inspectError(error) });
  });

  worker.on('stalled', (jobId) => {
    logger.warn('job stalled in worker', { queue: name, jobId });
  });

  cleanup.push(async () => {
    await queue.close();
    await events.close();
    await worker.close();
    await Promise.all([eventsConnection.quit(), workerConnection.quit()]);
  });

  return queue;
};

export type QueueMap = {
  [K in keyof JobData]: TypedQueue<K>;
};

export const initialize = async () => {
  const queues = {} as QueueMap;

  const flowConnection = createConnection('flow');
  const flow = new FlowProducer({ connection: flowConnection });

  cleanup.push(async () => {
    await flow.close().catch(() => null);
    await flowConnection.quit().catch(() => null);
  });

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
      logger.error(error instanceof Error ? error.message : String(error), { error });
      throw error;
    }
  };

  queues.sendMessage = await createQueue(dispatchJobs, sendMessageConfig);
  queues.messageRouter = await createQueue(dispatchJobs, messageRouterConfig);
  queues.timePeriodStats = await createQueue(dispatchJobs, timePeriodStatsConfig);
  queues.newSwapCheck = await createQueue(dispatchJobs, newSwapCheckConfig);
  queues.newDelegationActivityCheck = await createQueue(dispatchJobs, newDelegationActivityConfig);
  queues.newBurnCheck = await createQueue(dispatchJobs, newBurnCheckConfig);
  queues.newLpDepositCheck = await createQueue(dispatchJobs, newLpDepositCheck);
  queues.swapStatusCheck = await createQueue(dispatchJobs, swapStatusCheckConfig);
  queues.newSwapAlert = await createQueue(dispatchJobs, newSwapAlertConfig);
  queues.newLoanUpdateCheck = await createQueue(dispatchJobs, newLoanUpdateCheckConfig);
  queues.newLendingLiquidityChangeCheck = await createQueue(
    dispatchJobs,
    newLendingLiquidityChangeCheckConfig,
  );
  queues.newLiquidationCheck = await createQueue(dispatchJobs, newLiquidationCheckConfig);
  queues.liquidationStatusCheck = await createQueue(dispatchJobs, liquidationStatusCheckConfig);
  // this queue should be shut down first
  queues.scheduler = await createQueue(dispatchJobs, schedulerConfig);

  return queues;
};
