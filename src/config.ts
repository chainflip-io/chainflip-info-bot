import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import { z } from 'zod';
import type { DiscordConfig } from './channels/discord.js';
import type { TelegramConfig } from './channels/telegram.js';
import env from './env.js';

const messageTypes = z.enum(['DAILY_SUMMARY', 'WEEKLY_SUMMARY', 'NEW_SWAP', 'NEW_BURN', 'NEW_LP']);

export type MessageType = z.infer<typeof messageTypes>;

export type ChannelType = 'telegram' | 'discord';

const channelBase = z.object({
  enabled: z.boolean().optional().default(true),
  allowedMessageTypes: z.array(messageTypes).min(1).optional(),
});

const telegramConfig = z.object({
  botToken: z.string(),
  channels: z
    .array(z.object({ channelId: z.union([z.string(), z.number()]) }).and(channelBase))
    .min(1),
});

const discordConfig = z.object({
  channels: z.array(z.object({ webhookUrl: z.string().url() }).and(channelBase)).min(1),
});

export type ConfigKey = `${'telegram' | 'discord'}:${string}`;

type ConfigValue = (TelegramConfig & { type: 'telegram' }) | (DiscordConfig & { type: 'discord' });

type Channel = { key: ConfigKey; allowedMessageTypes?: MessageType[] };

const config = z
  .object({ telegram: telegramConfig.optional(), discord: discordConfig.optional() })
  .transform(({ telegram, discord }) => {
    const configHashMap = new Map<Config, ConfigValue>();
    const telegramChannels: Channel[] = [];
    const discordChannels: Channel[] = [];

    telegram?.channels
      .filter((c) => c.enabled)
      .forEach((channel) => {
        const key = `telegram:${sha1(telegram.botToken + channel.channelId.toString())}` as const;
        telegramChannels.push({ key, allowedMessageTypes: channel.allowedMessageTypes });
        configHashMap.set(key, {
          channelId: channel.channelId,
          token: telegram.botToken,
          type: 'telegram',
        });
      });

    discord?.channels
      .filter((c) => c.enabled)
      .forEach((channel) => {
        const key = `discord:${sha1(channel.webhookUrl)}` as const;
        discordChannels.push({
          key,
          allowedMessageTypes: channel.allowedMessageTypes,
        });
        configHashMap.set(key, { webhookUrl: channel.webhookUrl, type: 'discord' });
      });

    return {
      configHashMap,
      // these are arrays of hashed keys with the allowed message types. this allows the message
      // router to dispatch messages to the send message job queue for the appropriate channels
      // without exposing the actual webhooks and tokens to redis
      telegram: telegramChannels,
      discord: discordChannels,
    };
  });

export type ParsedConfig = z.output<typeof config>;
export type ConfigFile = z.input<typeof config>;

const sha1 = (data: string) => crypto.createHash('sha1').update(data).digest('hex');

export default class Config {
  static #config?: ParsedConfig;

  static async #load(): Promise<ParsedConfig> {
    if (!this.#config) {
      const configFile = env.CONFIG ?? (await fs.readFile('bot.config.json', 'utf-8'));
      this.#config = config.parse(JSON.parse(configFile));
    }

    return this.#config;
  }

  static async get(key: ConfigKey): Promise<ConfigValue> {
    const config = await this.#load();

    const value = config.configHashMap.get(key);

    if (!value) throw new Error(`Config not found: ${key}`);

    return value;
  }

  static async getChannels(channelType: ChannelType): Promise<Channel[] | undefined> {
    const config = await this.#load();

    return config[channelType];
  }
}
