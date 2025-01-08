import { Client, GatewayIntentBits } from 'discord.js';
import { handleExit } from '../utils/functions.js';
import logger from '../utils/logger.js';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

export const login = async (token: string) => {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  const { promise, resolve } = Promise.withResolvers<void>();
  if (client.user) {
    resolve();
  }
  client.once('ready', () => {
    logger.info('Discord: client ready');
    resolve();
  });
  client.once('debug', (obj) => {
    logger.debug(obj, 'discord debug');
  });
  client.once('error', (error) => {
    throw new Error(`Discord: an error occurred on discord connection: ${error}`);
  });
  client.once('shardReconnecting', () => {
    logger.warn(`Discord: shardReconnecting raised`);
  });
  client.once('shardDisconnect', () => {
    logger.warn(`Discord: shardDisconnect raised`);
  });
  handleExit(async () => {
    await client.destroy();
  });
  logger.info('Discord: Going to login');
  await client.login(token);
  logger.info('Discord: Logged in');
  return promise;
};

export type DiscordConfig = {
  token: string;
  channelId: string;
};

export const sendMessage = async (
  { token, channelId }: DiscordConfig,
  content: string,
  replyToId?: string,
) => {
  await login(token);

  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isSendable()) {
    throw new Error(`Channel not found: ${channelId}`);
  }
  if (replyToId) {
    const replyTo = await channel.messages.fetch(replyToId);
    const msg = await replyTo.reply(content);
    return msg.id;
  }
  const msg = await channel.send(content);
  return msg.id;
};
