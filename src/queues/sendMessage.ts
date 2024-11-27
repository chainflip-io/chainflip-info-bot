import { type JobConfig, type JobProcessor } from './initialize.js';
import { type DiscordConfig, sendMessage as sendDiscordMessage } from '../channels/discord.js';
import { sendMessage as sendTelegramMessage } from '../channels/telegram.js';
import { sendMessage as sendTwitterMessage } from '../channels/twitter.js';
import Config, { type ConfigKey } from '../config.js';

const name = 'sendMessage';

type Data = {
  key: ConfigKey;
  message: string;
  replyToId?: string;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const MESSAGE_LENGTH_LIMIT = 2000;
const breakDiscordMessage = (message: string) => {
  const lines = message.split('\n');
  let currentMessage = '';
  while (lines.length && currentMessage.length + lines[0].length + 1 <= MESSAGE_LENGTH_LIMIT) {
    currentMessage = currentMessage.concat(lines.shift()?.concat('\n') ?? '');
  }
  return {
    current: currentMessage.trim(),
    rest: lines.join('\n'),
  };
};
const sendDiscordMultipartMessage = async (
  config: DiscordConfig,
  message: string,
  replyToId?: string,
) => {
  const { current, rest } = breakDiscordMessage(message);
  const msgId = await sendDiscordMessage(config, current, replyToId);
  if (rest) {
    return { message: rest, replyToId: msgId };
  }
  return null;
};

const processJob: JobProcessor<typeof name> = (dispatchJobs) => async (job) => {
  const { message, key, replyToId } = job.data;

  const config = await Config.get(key);

  if (config.type === 'telegram') {
    await sendTelegramMessage(config, message);
  } else if (config.type === 'discord') {
    const rest = await sendDiscordMultipartMessage(config, message, replyToId);
    if (rest) await dispatchJobs([{ name: 'sendMessage' as const, data: { key, ...rest } }]);
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
