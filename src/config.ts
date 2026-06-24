import assert from 'assert';
import * as fs from 'fs/promises';
import { z } from 'zod';
import type { DiscordConfig } from './channels/discord.js';
import type { TelegramConfig } from './channels/telegram.js';
import type { TwitterConfig } from './channels/twitter.js';
import env from './env.js';

const filters = z.discriminatedUnion('name', [
  z.object({ name: z.literal('DAILY_SWAP_SUMMARY') }),
  z.object({ name: z.literal('WEEKLY_SWAP_SUMMARY') }),
  z.object({ name: z.literal('DAILY_LP_SUMMARY') }),
  z.object({ name: z.literal('WEEKLY_LP_SUMMARY') }),
  z.object({ name: z.literal('DAILY_BOOST_SUMMARY') }),
  z.object({ name: z.literal('WEEKLY_BOOST_SUMMARY') }),
  z.object({ name: z.literal('SWAP_COMPLETED'), minUsdValue: z.number().optional().default(0) }),
  z.object({ name: z.literal('NEW_SWAP'), minUsdValue: z.number().optional().default(0) }),
  z.object({ name: z.literal('NEW_BURN') }),
  z.object({ name: z.literal('NEW_LP') }),
  z.object({ name: z.literal('DELEGATION_EVENT') }),
  z.object({
    name: z.literal('NEW_BORROW'),
    minUsdValue: z.number().optional().default(0),
    excludeBoost: z.boolean().optional().default(false),
    boostMinUsdValue: z.number().optional(),
  }),
  z.object({
    name: z.literal('NEW_REPAYMENT'),
    minUsdValue: z.number().optional().default(0),
    excludeBoost: z.boolean().optional().default(false),
    boostMinUsdValue: z.number().optional(),
  }),
  z.object({ name: z.literal('NEW_DEPOSIT'), minUsdValue: z.number().optional().default(0) }),
  z.object({ name: z.literal('NEW_WITHDRAWAL') }),
  z.object({ name: z.literal('LIQUIDATION_INITIATED') }),
  z.object({ name: z.literal('LIQUIDATION_COMPLETED') }),
]);

export type Filter = z.infer<typeof filters>;

export type FilterData =
  | Exclude<Filter, { name: Extract<Filter, { minUsdValue: number }>['name'] }>
  | {
      name: 'SWAP_COMPLETED' | 'NEW_SWAP' | 'NEW_DEPOSIT';
      usdValue: number;
    }
  | {
      name: 'NEW_BORROW' | 'NEW_REPAYMENT';
      usdValue: number;
      isBoost: boolean;
    };

const specializedMessages: Filter['name'][] = ['NEW_SWAP'];

export const platforms = ['telegram', 'discord', 'twitter'] as const;

export type Platform = (typeof platforms)[number];

export type FilterMode = 'whitelist' | 'filter';

const channelBase = z.object({
  enabled: z.boolean().optional().default(true),
  // `whitelist`: only the listed message types are sent.
  // `filter`: the listed types are constrained by their rules
  filterMode: z.enum(['whitelist', 'filter']).optional().default('whitelist'),
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
  botToken: z.string(),
  channels: z.array(z.object({ channelId: z.string() }).and(channelBase)).min(1),
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

type Channel = { key: ConfigKey; filters?: Filter[]; filterMode?: FilterMode };

const replaceSpaces = (name: string) => name.replace(/\s+/g, '_');

const configSchema = z
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
        telegramChannels.push({ key, filters: channel.filters, filterMode: channel.filterMode });
        configHashMap.set(key, {
          channelId: channel.channelId,
          token: telegram.botToken,
          type: 'telegram',
        });
        channelNames.add(key);
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
          filterMode: channel.filterMode,
        });
        configHashMap.set(key, {
          token: discord.botToken,
          channelId: channel.channelId,
          type: 'discord',
        });
        channelNames.add(key);
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
          filterMode: channel.filterMode,
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

export type ParsedConfig = z.output<typeof configSchema>;
export type ConfigFile = z.input<typeof configSchema>;

export default class Config {
  static #config?: ParsedConfig;

  static async #load(): Promise<ParsedConfig> {
    if (!this.#config) {
      const configFile = env.CONFIG ?? (await fs.readFile('bot.config.json', 'utf-8'));
      this.#config = configSchema.parse(JSON.parse(configFile));
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

  static canSend(channel: Channel, filterData: FilterData): boolean {
    if (channel.filters === undefined) return !specializedMessages.includes(filterData.name);

    const filter = channel.filters.find((rule) => rule.name === filterData.name);

    // No explicit rule exists for this type.
    // In `whitelist` mode it's blocked;
    // In `filter` mode it's allowed;
    if (filter === undefined) {
      return channel.filterMode === 'filter' && !specializedMessages.includes(filterData.name);
    }

    if (filterData.name === 'NEW_BORROW' || filterData.name === 'NEW_REPAYMENT') {
      const rule = filter as Extract<Filter, { name: (typeof filterData)['name'] }>;
      if (filterData.isBoost) {
        if (rule.excludeBoost) return false;
        return filterData.usdValue >= (rule.boostMinUsdValue ?? rule.minUsdValue);
      }
      return filterData.usdValue >= rule.minUsdValue;
    }

    if (
      filterData.name === 'SWAP_COMPLETED' ||
      filterData.name === 'NEW_SWAP' ||
      filterData.name === 'NEW_DEPOSIT'
    ) {
      const rule = filter as Extract<Filter, { name: (typeof filterData)['name'] }>;
      return filterData.usdValue >= rule.minUsdValue;
    }

    return true;
  }
}
