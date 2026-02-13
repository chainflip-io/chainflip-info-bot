import { InternalAssetMap } from '@chainflip/utils/chainflip';

export const humanFriendlyAsset: InternalAssetMap<string> = {
  ArbEth: 'ETH on Arbitrum',
  ArbUsdc: 'USDC on Arbitrum',
  ArbUsdt: 'USDT on Arbitrum',
  Btc: 'BTC',
  Eth: 'ETH on Ethereum',
  Flip: 'FLIP on Ethereum',
  HubDot: 'DOT on Assethub',
  HubUsdc: 'USDC on Assethub',
  HubUsdt: 'USDT on Assethub',
  Sol: 'SOL',
  SolUsdc: 'USDC on Solana',
  SolUsdt: 'USDT on Solana',
  Usdc: 'USDC on Ethereum',
  Usdt: 'USDT on Ethereum',
  Wbtc: 'WBTC on Ethereum',
};

export const EXPLORER_URL = 'https://scan.chainflip.io';

export const BLOCK_TIME_IN_SECONDS = 6_000;

export const ASSET_FOR_BOOST_POOLS = 'Btc';
