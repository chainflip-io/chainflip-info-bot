import { anyAssetConstants, type AnyChainflipAsset } from '@chainflip/utils/chainflip';
import assert from 'assert';
import BigNumber from 'bignumber.js';

export function toUsdAmount(amount: BigNumber.Value): BigNumber;
export function toUsdAmount(amount: BigNumber.Value | null | undefined): BigNumber | null;
export function toUsdAmount(amount: BigNumber.Value | null | undefined): BigNumber | null {
  if (amount == null) return null;
  return new BigNumber(amount);
}

export function toAssetAmount(
  amount: BigNumber.Value,
  chainflipAsset: AnyChainflipAsset,
): BigNumber;
export function toAssetAmount(
  amount: BigNumber.Value | null | undefined,
  chainflipAsset: AnyChainflipAsset,
): BigNumber | null;
export function toAssetAmount(
  amount: BigNumber.Value | null | undefined,
  chainflipAsset: AnyChainflipAsset,
): BigNumber | null {
  if (amount == null) return null;
  return new BigNumber(amount).shiftedBy(-anyAssetConstants[chainflipAsset].decimals);
}

export function toFormattedAmount(amount: BigNumber): string;
export function toFormattedAmount(amount: string, chainflipAsset: AnyChainflipAsset): string;
export function toFormattedAmount(
  amount: BigNumber | string,
  chainflipAsset?: AnyChainflipAsset,
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
