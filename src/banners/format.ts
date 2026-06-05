export const formatUsdShort = (n: number): string => {
  // Tier 3 (>= $1M) uses 2 decimals (e.g. $1.28M); tier 1/2 use 1 decimal (e.g. $502.0K).
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(1)}`;
};

export const formatTokenAmount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return `${Math.round(minutes * 60)}s`;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  return `${hours.toFixed(1).replace(/\.0$/, '')}h`;
};

export const formatPercentDelta = (pct: number): string =>
  `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;

const AGGREGATOR_DISPLAY_OVERRIDES: Record<string, string> = {
  'THORSwap UI': 'THORSwap',
};

export const formatAggregator = (alias: string | undefined): string | undefined => {
  if (!alias) return undefined;
  return AGGREGATOR_DISPLAY_OVERRIDES[alias] ?? alias;
};
