import { type InternalAssetMap } from '@chainflip/utils/chainflip';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), 'assets');

type AssetMeta = {
  symbol: string;
  displayName: string;
  iconPath: string;
  smallIconPath: string;
  chainBadgePath?: string;
};

const ethChain = join(assetsDir, 'chains/eth.png');
const arbChain = join(assetsDir, 'chains/arb.png');
const assChain = join(assetsDir, 'chains/ass.png');
const solChain = join(assetsDir, 'chains/sol.png');

const token = (name: string) => ({
  iconPath: join(assetsDir, `tokens/${name}.png`),
  smallIconPath: join(assetsDir, `tokens/${name}.png`),
});

export const ASSET_REGISTRY: InternalAssetMap<AssetMeta> = {
  ArbEth: { symbol: 'ETH', displayName: 'ETH', ...token('eth'), chainBadgePath: arbChain },
  ArbUsdc: { symbol: 'USDC', displayName: 'USDC.arb', ...token('usdc'), chainBadgePath: arbChain },
  ArbUsdt: { symbol: 'USDT', displayName: 'USDT.arb', ...token('usdt'), chainBadgePath: arbChain },
  Btc: {
    symbol: 'BTC',
    displayName: 'BTC',
    ...token('btc'),
    smallIconPath: join(assetsDir, 'tokens/bitcoin small.png'),
  },
  Eth: { symbol: 'ETH', displayName: 'ETH', ...token('eth') },
  Flip: { symbol: 'FLIP', displayName: 'FLIP', ...token('flip') },
  HubDot: { symbol: 'DOT', displayName: 'DOT', ...token('dot') },
  HubUsdc: { symbol: 'USDC', displayName: 'USDC.hub', ...token('usdc'), chainBadgePath: assChain },
  HubUsdt: { symbol: 'USDT', displayName: 'USDT.hub', ...token('usdt'), chainBadgePath: assChain },
  Sol: { symbol: 'SOL', displayName: 'SOL', ...token('sol') },
  SolUsdc: { symbol: 'USDC', displayName: 'USDC.sol', ...token('usdc'), chainBadgePath: solChain },
  SolUsdt: { symbol: 'USDT', displayName: 'USDT.sol', ...token('usdt'), chainBadgePath: solChain },
  Usdc: { symbol: 'USDC', displayName: 'USDC.eth', ...token('usdc'), chainBadgePath: ethChain },
  Usdt: { symbol: 'USDT', displayName: 'USDT.eth', ...token('usdt'), chainBadgePath: ethChain },
  Wbtc: { symbol: 'WBTC', displayName: 'WBTC', ...token('wbtc') },
};

const dataUrlCache = new Map<string, Promise<string>>();

const loadDataUrl = (path: string): Promise<string> => {
  let cached = dataUrlCache.get(path);
  if (!cached) {
    cached = readFile(path).then((buf) => `data:image/png;base64,${buf.toString('base64')}`);
    dataUrlCache.set(path, cached);
  }
  return cached;
};

export type BannerAsset = {
  symbol: string;
  iconUrl: string;
  smallIconUrl: string;
  chainBadgeUrl?: string;
};

export const loadAsset = async (
  asset: keyof typeof ASSET_REGISTRY,
): Promise<BannerAsset> => {
  const meta = ASSET_REGISTRY[asset];
  return {
    symbol: meta.symbol,
    iconUrl: await loadDataUrl(meta.iconPath),
    smallIconUrl: await loadDataUrl(meta.smallIconPath),
    chainBadgeUrl: meta.chainBadgePath ? await loadDataUrl(meta.chainBadgePath) : undefined,
  };
};
