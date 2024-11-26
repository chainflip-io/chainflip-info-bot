import { deferredPromise } from '@chainflip/utils/async';
import { Client, GatewayIntentBits } from 'discord.js';
import { handleExit } from '../utils/functions.js';
import logger from '../utils/logger.js';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

export const login = async (token: string) => {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  const { promise, resolve } = deferredPromise<void>();
  if (client.user) {
    resolve();
  }
  client.once('ready', () => {
    logger.info('Discord client ready');
    resolve();
  });
  client.once('debug', (obj) => {
    logger.debug(obj, 'discord debug');
  });
  client.once('error', (error) => {
    throw new Error(`an error occurred on discord connection: ${error}`);
  });
  handleExit(async () => {
    await client.destroy();
  });
  await client.login(token);
  return promise;
};

export type DiscordConfig = {
  token: string;
  channelId: string;
};

export const sendMessage = async ({ token, channelId }: DiscordConfig, content: string) => {
  await login(token);

  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isSendable()) {
    throw new Error(`Channel not found: ${channelId}`);
  }
  try {
    const msg = await channel.send(content);
    return msg.id;
  } catch (err) {
    throw new Error(`Failed to send message to discord: ${err as Error}`);
  }
};
