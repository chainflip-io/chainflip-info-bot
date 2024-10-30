import { BigNumber } from 'bignumber.js';
import { assetDecimals } from '../consts.js';
import { ChainflipAsset } from '../graphql/generated/graphql.js';

export const getPriceFromPriceX128 = (
  priceX128: bigint | string,
  srcAsset: ChainflipAsset,
  destAsset: ChainflipAsset,
) =>
  BigNumber(priceX128.toString())
    .dividedBy(new BigNumber(2).pow(128))
    .shiftedBy(assetDecimals[srcAsset] - assetDecimals[destAsset])
    .toFixed(assetDecimals[destAsset]);
