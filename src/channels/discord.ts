import { Client, GatewayIntentBits, type TextChannel } from 'discord.js';
import logger from '../utils/logger.js';
import { deferredPromise } from '../utils/promise.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const login = async (token: string) => {
  const { promise, resolve } = deferredPromise<undefined>();
  client.once('ready', () => {
    logger.info('Discord client ready');
    resolve(undefined);
  });
  client.once('debug', (obj) => {
    logger.debug(obj, 'discord debug');
  });
  client.once('error', (error) => {
    throw new Error(`an error occurred on discord connection: ${error}`);
  });
  await client.login(token);
  return promise;
};

export type DiscordConfig = {
  token: string;
  channelId: string;
};

export const sendMessage = async ({ token, channelId }: DiscordConfig, content: string) => {
  if (!client.user) {
    await login(token);
  }

  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased()) {
    throw new Error(`Channel not found: ${channelId}`);
  }
  await (channel as TextChannel).send(content);
};
