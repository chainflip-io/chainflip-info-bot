import assert from 'assert';
import { JobConfig, JobProcessor } from './initialize.js';
import { sendMessage as sendDiscordMessage } from '../channels/discord.js';
import { sendMessage as sendTelegramMessage } from '../channels/telegram.js';
import env from '../env.js';

const name = 'messages';

type Data = {
  channel: 'telegram' | 'discord';
  message: string;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<typeof name, Data> = () => async (job) => {
  const { channel, message } = job.data;

  if (channel === 'telegram') {
    assert(env.TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN is required');
    assert(env.TELEGRAM_CHANNEL_ID, 'TELEGRAM_CHANNEL_ID is required');
    await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHANNEL_ID, message);
  } else {
    assert(env.DISCORD_WEBHOOK_URL, 'DISCORD_WEBHOOK_URL is required');
    await sendDiscordMessage(env.DISCORD_WEBHOOK_URL, message);
  }
};

export const config: JobConfig<typeof name, Data> = {
  name,
  processJob,
};
