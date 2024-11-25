import { deferredPromise } from '@chainflip/utils/async';
import { Client, GatewayIntentBits, type TextChannel } from 'discord.js';
import logger from '../utils/logger.js';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

export const login = async (token: string) => {
  const { resolve } = deferredPromise<undefined>();
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
  const result = await (channel as TextChannel).send(content);
  if (!result) {
    throw new Error(`Failed to send message to discord: ${JSON.stringify(result)}`);
  }
};
