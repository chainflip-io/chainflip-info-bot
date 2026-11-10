import {
  type AnyChainflipChain,
  assetConstants,
  type ChainflipAsset,
} from '@chainflip/utils/chainflip';

// Accounts tagged in the banner photo on X (not in the caption, so no characters used).
// null = no official account worth tagging.
const CHAIN_HANDLES: Record<AnyChainflipChain, string | null> = {
  Bitcoin: null, // no official account; @Bitcoin is community-run
  Ethereum: 'ethereum',
  Arbitrum: 'arbitrum',
  Solana: 'solana',
  Polkadot: 'Polkadot',
  Assethub: 'Polkadot',
  Tron: 'trondao',
  Bsc: 'BNBCHAIN',
};

// Issuer accounts for non-native assets. Native coins (ETH, SOL, BNB...) use the chain.
const ASSET_ISSUER_HANDLES: Partial<Record<ChainflipAsset, string>> = {
  Usdt: 'Tether_to',
  ArbUsdt: 'Tether_to',
  SolUsdt: 'Tether_to',
  HubUsdt: 'Tether_to',
  TrxUsdt: 'Tether_to',
  BscUsdt: 'Tether_to',
  Usdc: 'circle',
  ArbUsdc: 'circle',
  SolUsdc: 'circle',
  HubUsdc: 'circle',
  Cbbtc: 'coinbase',
  Wbtc: 'WrappedBTC',
};

// X allows up to 10 photo tags per post.
const MAX_PHOTO_TAGS = 10;

// Order: source asset, source chain, destination asset, destination chain (deduped).
export const photoTagHandlesFor = (source: ChainflipAsset, dest: ChainflipAsset): string[] => {
  const handles = [source, dest].flatMap((asset) => [
    ASSET_ISSUER_HANDLES[asset],
    CHAIN_HANDLES[assetConstants[asset].chain],
  ]);
  const seen = new Set<string>();
  return handles
    .filter((h): h is string => !!h)
    .filter((h) => !seen.has(h.toLowerCase()) && !!seen.add(h.toLowerCase()))
    .slice(0, MAX_PHOTO_TAGS);
};
