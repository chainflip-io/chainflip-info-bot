import { JobConfig, JobProcessor } from './initialize.js';
import Config, { Platform, ValidationData } from '../config.js';
import logger from '../utils/logger.js';

const name = 'messageRouter';
type Name = typeof name;

type Data = {
  platform: Platform;
  message: string;
  validationData: ValidationData;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const { message, validationData, platform } = job.data;

  const channels = await Config.getChannels(platform);

  const jobs = channels
    ?.filter((channel) => Config.canSend(channel, validationData))
    .map(({ key }) => ({ name: 'sendMessage' as const, data: { key, message } }));

  if (jobs?.length) await dispatchJobs(jobs);

  logger.info(`Dispatched ${jobs?.length ?? 0} jobs for message type ${validationData.name}`);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
