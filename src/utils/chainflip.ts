import assert from 'assert';
import { BigNumber } from 'bignumber.js';
import { assetDecimals } from '../consts.js';
import { ChainflipAsset } from '../graphql/generated/graphql.js';

export const chainConstants = {
  Bitcoin: {
    blockTimeSeconds: 10 * 60,
  },
  Ethereum: {
    blockTimeSeconds: 12,
  },
  Solana: {
    blockTimeSeconds: 0.8,
  },
  Arbitrum: {
    blockTimeSeconds: 0.26,
  },
  Polkadot: {
    blockTimeSeconds: 6,
  },
} as const;

export type ChainflipChain = 'Bitcoin' | 'Ethereum' | 'Solana' | 'Arbitrum' | 'Polkadot';

export const toAssetAmount = (amount: string, chainflipAsset: ChainflipAsset): BigNumber =>
  new BigNumber(amount).shiftedBy(-assetDecimals[chainflipAsset]);

export function toFormattedAmount(amount: BigNumber): string;
export function toFormattedAmount(amount: string, chainflipAsset: ChainflipAsset): string;
export function toFormattedAmount(
  amount: BigNumber | string,
  chainflipAsset?: ChainflipAsset,
): string {
  let bigNumber;

  if (typeof amount === 'string') {
    assert(chainflipAsset, 'chainflipAsset is required when amount is a string');

    bigNumber = toAssetAmount(amount, chainflipAsset);
  } else {
    bigNumber = amount;
  }

  // remove trailing zeros
  return bigNumber.toFormat(6).replace(/\.?0+$/, '');
}
