import { ChainflipAsset } from './graphql/generated/graphql.js';

export const FLIP_DECIMAL_POINTS = 18;

export const assetDecimals: Record<ChainflipAsset, number> = {
  ArbEth: 18,
  ArbUsdc: 6,
  Btc: 8,
  Dot: 10,
  Eth: 18,
  Flip: 18,
  Sol: 9,
  SolUsdc: 6,
  Usdc: 6,
  Usdt: 6,
};
