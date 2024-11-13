import { JobConfig, JobProcessor } from './initialize.js';
import { sendMessage as sendDiscordMessage } from '../channels/discord.js';
import { sendMessage as sendTelegramMessage } from '../channels/telegram.js';
import { sendMessage as sendTwitterMessage } from '../channels/twitter.js';
import Config, { ConfigKey } from '../config.js';

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
  } else if (config.type === 'twitter') {
    await sendTwitterMessage(config, message);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    throw new Error(`Invalid config type: ${(config as any).type}`);
  }
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
