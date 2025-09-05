import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import getLatestDelegationActivityId from '../queries/getLatestDelegationActivityId.js';
import getNewDelegationActivityRequestsQuery from '../queries/getNewDelegationActivity.js';
import logger from '../utils/logger.js';

const name = 'newDelegationActivityCheck';
type Name = typeof name;

const INTERVAL = 30_000;

export const getNextJobData = async (
  delegationActivityId: number | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newDelegationActivityCheck';

  return {
    name: 'scheduler',
    data: [
      {
        name,
        data: {
          delegationActivityId: delegationActivityId ?? (await getLatestDelegationActivityId()),
        },
      },
    ],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

type Data = {
  delegationActivityId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(
    `Checking for new delegation requests, delegationActivityId: ${job.data.delegationActivityId}`,
    job.data,
  );
  const newDelegationActvityRequest = await getNewDelegationActivityRequestsQuery(
    job.data.delegationActivityId,
  );

  const delegationActivityRequestJobs = newDelegationActvityRequest.flatMap((id) => [
    // check
    { name: 'delegationActivityStatusCheck' as const, data: { delegationActivityId: id } },
  ]);

  const latesDelegationActivityId = newDelegationActvityRequest
    .map((id) => Number(id))
    .reduce((a, b) => (a > b ? a : b), Number(job.data.delegationActivityId));

  logger.info(`Current latest swapRequestId: ${latesDelegationActivityId}`);

  const data = await getNextJobData(latesDelegationActivityId);

  await dispatchJobs([data, ...delegationActivityRequestJobs]);

  logger.info(
    { newDelegationActvityRequest },
    `Found ${newDelegationActvityRequest.length} new swap requests`,
  );
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
