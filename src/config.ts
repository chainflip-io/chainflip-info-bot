import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import { z } from 'zod';
import type { DiscordConfig } from './channels/discord.js';
import type { TelegramConfig } from './channels/telegram.js';
import env from './env.js';

const filters = z.union([
  z.object({ name: z.literal('DAILY_SUMMARY') }),
  z.object({ name: z.literal('WEEKLY_SUMMARY') }),
  z.object({ name: z.literal('NEW_SWAP'), usdValue: z.number().optional().default(0) }),
  z.object({ name: z.literal('NEW_BURN') }),
  z.object({ name: z.literal('NEW_LP') }),
]);

export type Filter = z.infer<typeof filters>;

export type Platform = 'telegram' | 'discord';

const channelBase = z.object({
  enabled: z.boolean().optional().default(true),
  filters: z.array(filters).min(1).optional(),
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

type Channel = { key: ConfigKey; filters?: Filter[] };

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
        telegramChannels.push({ key, filters: channel.filters });
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
          filters: channel.filters,
        });
        configHashMap.set(key, { webhookUrl: channel.webhookUrl, type: 'discord' });
      });

    return {
      configHashMap,
      // these are arrays of hashed keys with the channel filters. this allows the message router to
      // dispatch messages to the send message job queue for the appropriate channels without
      // exposing the actual webhooks and tokens to redis
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

  static async getChannels(platform: Platform): Promise<Channel[] | undefined> {
    const config = await this.#load();

    return config[platform];
  }

  static canSend(channel: Channel, validationData: Filter): boolean {
    if (channel.filters === undefined) return true;

    switch (validationData.name) {
      case 'NEW_SWAP': {
        const filter = channel.filters.find((rule) => rule.name === validationData.name);
        return filter !== undefined && filter.usdValue <= validationData.usdValue;
      }
      default:
        return channel.filters.some((rule) => rule.name === validationData.name);
    }
  }
}
