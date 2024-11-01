import { JobConfig, JobProcessor } from './initialize.js';
import Config, { ChannelType, MessageType } from '../config.js';
import logger from '../utils/logger.js';

const name = 'messageRouter';
type Name = typeof name;

type Data = {
  channel: ChannelType;
  message: string;
  messageType: MessageType;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const { message, messageType, channel } = job.data;

  const channels = await Config.getChannels(channel);

  const jobs = channels
    ?.filter(
      ({ allowedMessageTypes }) =>
        allowedMessageTypes === undefined || allowedMessageTypes.includes(messageType),
    )
    .map(({ key }) => ({
      name: 'sendMessage' as const,
      data: { key, message },
    }));

  if (jobs?.length) await dispatchJobs(jobs);

  logger.info(`Dispatched ${jobs?.length ?? 0} jobs for message type ${messageType}`);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
