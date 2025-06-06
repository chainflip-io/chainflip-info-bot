import { InternalAssetMap } from '@chainflip/utils/chainflip';

export const humanFriendlyAsset: InternalAssetMap<string> = {
  ArbEth: 'ETH on Arbitrum',
  ArbUsdc: 'USDC on Arbitrum',
  Btc: 'BTC',
  Dot: 'DOT',
  Eth: 'ETH on Ethereum',
  Flip: 'FLIP on Ethereum',
  Sol: 'SOL',
  SolUsdc: 'USDC on Solana',
  Usdc: 'USDC on Ethereum',
  Usdt: 'USDT on Ethereum',
  HubDot: 'DOT on Assethub',
  HubUsdt: 'USDT on Assethub',
  HubUsdc: 'USDC on Assethub',
};

export const EXPLORER_URL = 'https://scan.chainflip.io';

export const BLOCK_TIME_IN_SECONDS = 6_000;

export const ASSET_FOR_BOOST_POOLS = 'Btc';
