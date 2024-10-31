import { JobConfig, JobProcessor } from './initialize.js';
import { sendMessage as sendDiscordMessage } from '../channels/discord.js';
import { sendMessage as sendTelegramMessage } from '../channels/telegram.js';
import Config, { ConfigKey } from '../config.js';
import logger from '../utils/logger.js';

const name = 'sendMessage';

type Data = {
  key: ConfigKey;
  message: string;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<typeof name> = () => async (job) => {
  const { message, key } = job.data;

  const config = await Config.get(key);

  if (config.type === 'telegram') {
    await sendTelegramMessage(config, message);
  } else if (config.type === 'discord') {
    await sendDiscordMessage(config, message);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const message = `Invalid config type: ${(config as any).type}`;
    logger.error(message);
    throw new Error(message);
  }
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
