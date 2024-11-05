import assert from 'assert';
import * as fs from 'fs/promises';
import { z } from 'zod';
import type { DiscordConfig } from './channels/discord.js';
import type { TelegramConfig } from './channels/telegram.js';
import type { TwitterConfig } from './channels/twitter.js';
import env from './env.js';

const filters = z.union([
  z.object({ name: z.literal('DAILY_SWAP_SUMMARY') }),
  z.object({ name: z.literal('WEEKLY_SWAP_SUMMARY') }),
  z.object({ name: z.literal('DAILY_LP_SUMMARY') }),
  z.object({ name: z.literal('WEEKLY_LP_SUMMARY') }),
  z.object({ name: z.literal('NEW_SWAP'), minUsdValue: z.number().optional().default(0) }),
  z.object({ name: z.literal('NEW_BURN') }),
  z.object({ name: z.literal('NEW_LP') }),
]);

export type Filter = z.infer<typeof filters>;

export type ValidationData =
  | Exclude<Filter, { name: 'NEW_SWAP' }>
  | { name: 'NEW_SWAP'; usdValue: number };

export const platforms = ['telegram', 'discord', 'twitter'] as const;

export type Platform = (typeof platforms)[number];

const channelBase = z.object({
  enabled: z.boolean().optional().default(true),
  filters: z.array(filters).min(1).optional(),
  name: z.string(),
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

const twitterConfig = z.object({
  channels: z
    .array(
      z
        .object({
          name: z.string(),
          consumerKey: z.string(),
          consumerKeySecret: z.string(),
          oauthKey: z.string(),
          oauthKeySecret: z.string(),
        })
        .and(channelBase),
    )
    .min(1),
});

export type ConfigKey = `${'telegram' | 'discord' | 'twitter'}:${string}`;

type ConfigValue =
  | (TelegramConfig & { type: 'telegram' })
  | (DiscordConfig & { type: 'discord' })
  | (TwitterConfig & { type: 'twitter' });

type Channel = { key: ConfigKey; filters?: Filter[] };

const replaceSpaces = (name: string) => name.replace(/\s+/g, '_');

const config = z
  .object({
    telegram: telegramConfig.optional(),
    discord: discordConfig.optional(),
    twitter: twitterConfig.optional(),
  })
  .transform(({ telegram, discord, twitter }) => {
    const configHashMap = new Map<Config, ConfigValue>();
    const telegramChannels: Channel[] = [];
    const discordChannels: Channel[] = [];
    const twitterChannels: Channel[] = [];

    const channelNames = new Set<string>();
    let enabledChannelCount = 0;

    telegram?.channels
      .filter((c) => c.enabled)
      .forEach((channel) => {
        const name = replaceSpaces(channel.name);
        const key = `telegram:${name}` as const;
        telegramChannels.push({ key, filters: channel.filters });
        configHashMap.set(key, {
          channelId: channel.channelId,
          token: telegram.botToken,
          type: 'telegram',
        });
        channelNames.add(name);
        enabledChannelCount += 1;
      });

    discord?.channels
      .filter((c) => c.enabled)
      .forEach((channel) => {
        const name = replaceSpaces(channel.name);
        const key = `discord:${name}` as const;
        discordChannels.push({
          key,
          filters: channel.filters,
        });
        configHashMap.set(key, { webhookUrl: channel.webhookUrl, type: 'discord' });
        channelNames.add(name);
        enabledChannelCount += 1;
      });

    twitter?.channels
      .filter((c) => c.enabled)
      .forEach((channel) => {
        const name = replaceSpaces(channel.name);
        const key = `twitter:${name}` as const;
        twitterChannels.push({
          key,
          filters: channel.filters,
        });
        configHashMap.set(key, {
          consumerKey: channel.consumerKey,
          consumerKeySecret: channel.consumerKeySecret,
          oauthKey: channel.oauthKey,
          oauthKeySecret: channel.oauthKeySecret,
          type: 'twitter',
        });
        channelNames.add(name);
        enabledChannelCount += 1;
      });

    assert(channelNames.size === enabledChannelCount, 'channel names must be unique');

    return {
      configHashMap,
      // these are arrays of hashed keys with the channel filters. this allows the message router to
      // dispatch messages to the send message job queue for the appropriate channels without
      // exposing the actual webhooks and tokens to redis
      telegram: telegramChannels,
      discord: discordChannels,
      twitter: twitterChannels,
    };
  });

export type ParsedConfig = z.output<typeof config>;
export type ConfigFile = z.input<typeof config>;

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

  static canSend(channel: Channel, validationData: ValidationData): boolean {
    if (channel.filters === undefined) return true;

    switch (validationData.name) {
      case 'NEW_SWAP': {
        const filter = channel.filters.find((rule) => rule.name === validationData.name);
        return filter !== undefined && validationData.usdValue >= filter.minUsdValue;
      }
      default:
        return channel.filters.some((rule) => rule.name === validationData.name);
    }
  }
}
