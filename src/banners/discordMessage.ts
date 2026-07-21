import { type ChainflipAsset } from '@chainflip/utils/chainflip';
import { ASSET_REGISTRY } from './assetRegistry.js';
import { TIER_1_THRESHOLD, TIER_2_THRESHOLD } from './buildBanner.js';

const BROKER_HANDLES: Record<string, string | null> = {
  'swap.chainflip.io': '@Chainflip',
  'Chainflip SDK': '@Chainflip',
  'Broker as a Service': '@ChainflipBaaS',
  Rango: '@rangoexchange',
  SwapKit: '@SwapKitPowered',
  'Li.Fi': '@lifiprotocol',
  HoudiniSwap: '@HoudiniSwap',
  Symbiosis: '@symbiosis_fi',
  THORWallet: '@Thorwallet',
  THORSwap: '@THORSwap',
  SwapSpace: '@swapspaceco',
  Portal: '@portalbridge_',
};

const INTEGRATOR_HANDLES: Record<string, string | null> = {
  'Trust Wallet': '@TrustWallet',
  'Binance Web3 Wallet': '@BinanceWallet',
  'Crypto.com': '@cryptocom',
  'Cake Wallet': '@cakewallet',
  Tangem: '@Tangem',
  'Gem Wallet': '@GemWallet',
  ShapeShift: '@ShapeShift',
  Jumper: '@JumperApp',
  Phantom: '@phantom',
  MetaMask: '@MetaMask',
  SafePal: '@SafePal',
  Xverse: '@xverse',
  Leodex: '@leodexio',
  Subwallet: '@subwalletapp',
  Asgardex: '@asgardex',
  Squid: '@squidrouter',
  Talisman: '@wearetalisman',
  OrangeRock: '@orangerockxyz',
  Leather: '@Leatherfinance',
  BiorVault: '@biorlabs',
  Wagyu: null,
  BCDC: null,
  'Rango Direct': '@rangoexchange',
  'THORSwap UI': '@THORSwap',
  MakePay: '@MakePayio',
};

// Resolves an alias to a display string. Returns null only for empty / 'unknown'.
// Known alias with mapped value → mapped value (e.g. '@Chainflip').
// Known alias with null value → the alias itself (party is known but has no handle).
// Unknown alias → raw alias as plain text (defensive fallback).
const resolveAlias = (
  map: Record<string, string | null>,
  alias: string | undefined,
): string | null => {
  if (!alias || alias.toLowerCase() === 'unknown') return null;
  if (alias in map) return map[alias] ?? alias;
  const key = Object.keys(map).find((k) => k.toLowerCase() === alias.toLowerCase());
  if (key) return map[key] ?? key;
  return alias;
};

const STABLES = new Set(['USDC', 'USDT']);

const stripTrailingZeros = (s: string): string =>
  s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;

const formatAmount = (asset: ChainflipAsset, amount: number): string => {
  const meta = ASSET_REGISTRY[asset];
  const display = meta.displayName;

  if (STABLES.has(meta.symbol)) {
    if (amount >= 1_000_000) {
      return `${stripTrailingZeros((amount / 1_000_000).toFixed(2))}M ${display}`;
    }
    if (amount >= 1_000) {
      return `${stripTrailingZeros((amount / 1_000).toFixed(2))}K ${display}`;
    }
    return `${Math.round(amount)} ${display}`;
  }

  const num =
    amount >= 100 ? stripTrailingZeros(amount.toFixed(1)) : stripTrailingZeros(amount.toFixed(2));
  return `${num} ${display}`;
};

const formatUsdCopy = (value: number): string => {
  if (value >= 1_000_000) {
    return `$${stripTrailingZeros((value / 1_000_000).toFixed(2))}M`;
  }
  return `$${Math.round(value / 1_000)}K`;
};

const formatDurationCopy = (minutes: number): string => {
  if (minutes < 1) {
    const secs = Math.max(1, Math.round(minutes * 60));
    return `${secs} second${secs === 1 ? '' : 's'}`;
  }
  const m = Math.round(minutes);
  return `${m} minute${m === 1 ? '' : 's'}`;
};

const formatDurationShortCopy = (minutes: number): string => {
  if (minutes < 1) {
    const secs = Math.max(1, Math.round(minutes * 60));
    return `${secs}s`;
  }
  return `${Math.round(minutes)} min`;
};

const formatDeltaCopy = (pct: number): string => `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;

// Chainflip's own default brokers — when one of these is paired with a distinct
// integrator, the "routed through" clause is redundant (every swap goes through us).
const CHAINFLIP_DEFAULT_BROKERS = new Set(
  ['swap.chainflip.io', 'Chainflip SDK', 'Broker as a Service'].map((s) => s.toLowerCase()),
);

const isChainflipDefaultBroker = (alias: string | undefined): boolean =>
  !!alias && CHAINFLIP_DEFAULT_BROKERS.has(alias.toLowerCase());

const resolveParties = (
  brokerAlias: string | undefined,
  affiliateAlias: string | undefined,
): { primary: string; secondary: string | null } | null => {
  const integrator = resolveAlias(INTEGRATOR_HANDLES, affiliateAlias);
  const broker = resolveAlias(BROKER_HANDLES, brokerAlias);
  if (integrator && broker && integrator !== broker && !isChainflipDefaultBroker(brokerAlias)) {
    return { primary: integrator, secondary: broker };
  }
  if (integrator) return { primary: integrator, secondary: null };
  if (broker) return { primary: broker, secondary: null };
  return null;
};

const SCAN_BASE = 'https://scan.chainflip.io/swaps';

export type DiscordMessageInput = {
  usdValue: number;
  sourceAsset: ChainflipAsset;
  sourceAmount: number;
  destAsset: ChainflipAsset;
  destAmount: number;
  brokerAlias?: string;
  affiliateAlias?: string;
  swapId: string;
  durationMinutes?: number;
  isBoosted: boolean;
  originalDurationMinutes?: number;
  oraclePriceDeltaPct?: number;
};

const tierOf = (usdValue: number): 1 | 2 | 3 =>
  usdValue >= TIER_2_THRESHOLD ? 3 : usdValue >= TIER_1_THRESHOLD ? 2 : 1;

const formatPair = (input: DiscordMessageInput): string =>
  `${formatAmount(input.sourceAsset, input.sourceAmount)} → ${formatAmount(input.destAsset, input.destAmount)}`;

const tier1Regular = (input: DiscordMessageInput, pair: string): string => {
  const parties = resolveParties(input.brokerAlias, input.affiliateAlias);
  const viaClause = parties ? ` via ${parties.primary}` : '';

  const lines: string[] = [];
  if (input.oraclePriceDeltaPct !== undefined) {
    lines.push(`${pair} at ${formatDeltaCopy(input.oraclePriceDeltaPct)} vs market.`);
  } else {
    lines.push(`${pair}.`);
  }
  if (input.durationMinutes !== undefined) {
    lines.push(`Settled in ${formatDurationCopy(input.durationMinutes)}${viaClause}.`);
  } else if (viaClause) {
    lines.push(`Settled${viaClause}.`);
  }
  lines.push('', `${SCAN_BASE}/${input.swapId}`);
  return lines.join('\n');
};

const tier1Boosted = (input: DiscordMessageInput, pair: string): string => {
  const parties = resolveParties(input.brokerAlias, input.affiliateAlias);
  const viaClause = parties ? ` via ${parties.primary}` : '';

  const inDuration =
    input.durationMinutes !== undefined ? ` in ${formatDurationCopy(input.durationMinutes)}` : '';
  const nativeClause =
    input.originalDurationMinutes !== undefined &&
    input.originalDurationMinutes !== input.durationMinutes
      ? ` (vs ${formatDurationShortCopy(input.originalDurationMinutes)} native)`
      : '';

  const lines: string[] = [`${pair}${inDuration} via Boost${nativeClause}.`];
  if (viaClause) lines.push(`Settled${viaClause}.`);
  lines.push('', `${SCAN_BASE}/${input.swapId}`);
  return lines.join('\n');
};

const tier23 = (input: DiscordMessageInput, pair: string): string => {
  const parties = resolveParties(input.brokerAlias, input.affiliateAlias);

  let route = '';
  if (parties?.secondary) {
    route = ` via ${parties.primary}, routed through ${parties.secondary}`;
  } else if (parties) {
    route = ` via ${parties.primary}`;
  }

  const usd = formatUsdCopy(input.usdValue);
  const inDuration =
    input.durationMinutes !== undefined ? ` in ${formatDurationCopy(input.durationMinutes)}` : '';
  const nativeClause =
    input.isBoosted &&
    input.originalDurationMinutes !== undefined &&
    input.originalDurationMinutes !== input.durationMinutes
      ? ` (vs ${formatDurationShortCopy(input.originalDurationMinutes)} native)`
      : '';

  const headline = input.isBoosted
    ? `${usd} cross-chain${inDuration} via Boost${nativeClause}.`
    : inDuration
      ? `${usd} cross-chain${inDuration}.`
      : `${usd} swap.`;

  const lines: string[] = [headline, '', `${pair}${route}.`];
  if (input.oraclePriceDeltaPct !== undefined) {
    lines.push(`Settled ${formatDeltaCopy(input.oraclePriceDeltaPct)} vs market.`);
  }
  lines.push('', `${SCAN_BASE}/${input.swapId}`);
  return lines.join('\n');
};

export const formatDiscordMessage = (input: DiscordMessageInput): string => {
  const pair = formatPair(input);
  const tier = tierOf(input.usdValue);
  if (tier === 1) {
    return input.isBoosted ? tier1Boosted(input, pair) : tier1Regular(input, pair);
  }
  return tier23(input, pair);
};
