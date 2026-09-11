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

// Matches emoji, their skin-tone modifiers, regional-indicator flag halves,
// variation selectors and zero-width joiners.
const EMOJI_RE =
  /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\p{Variation_Selector}\p{Join_Control}]/gu;

// Strips emoji, collapses whitespace, and trims. Aliases come from user-set
// broker/integrator names and sometimes carry emoji, which break handle lookups
// and can't be rendered on the banner.
export const normalizeAlias = (alias: string): string =>
  alias.replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();

export const formatAggregator = (alias: string | undefined): string | undefined => {
  if (!alias) return undefined;
  const normalized = normalizeAlias(alias);
  if (!normalized) return undefined;
  return AGGREGATOR_DISPLAY_OVERRIDES[normalized] ?? normalized;
};
